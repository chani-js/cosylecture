// src/services/booksService.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase.js';

// Référence vers la collection de livres d'un utilisateur
export function userBooksRef(userId) {
  return collection(db, 'users', userId, 'books');
}

// Abonnement temps réel aux livres d'un utilisateur
export function subscribeToBooks(userId, callback) {
  const ref = userBooksRef(userId);
  const q = query(ref, orderBy('updatedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(items);
  });
}

// Création / mise à jour d'un livre
export async function saveBook(userId, book) {
  const ref = userBooksRef(userId);
  const payload = {
    title: book.title || '',
    author: book.author || '',
    status: book.status || 'a_acheter',
    rating: book.rating || '',
    tags: Array.isArray(book.tags) ? book.tags : [],
    comment: book.comment || '',
    coverUrl: book.coverUrl || '',
    updatedAt: Date.now(),
  };

  if (book.id) {
    await updateDoc(doc(ref, book.id), payload);
    return book.id;
  } else {
    payload.createdAt = Date.now();
    const docRef = await addDoc(ref, payload);
    return docRef.id;
  }
}

// Suppression
export async function deleteBook(userId, id) {
  const ref = userBooksRef(userId);
  await deleteDoc(doc(ref, id));
}

// Passage à la liste suivante (cycle Kanban)
export async function cycleStatus(userId, book) {
  const order = ['a_acheter', 'a_lire', 'en_cours', 'termine'];
  const currentIndex = order.indexOf(book.status || 'a_acheter');
  const next = order[(currentIndex + 1) % order.length];

  const ref = userBooksRef(userId);
  await updateDoc(doc(ref, book.id), {
    status: next,
    updatedAt: Date.now(),
  });
}

// Suggestions de livres via OpenLibrary
export async function searchBooks(text) {
  const q = text.trim();
  if (!q) return [];
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch (e) {
    console.error('Erreur OpenLibrary', e);
    return [];
  }
}
