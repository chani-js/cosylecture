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
import { db } from './firebase';

export const STATUS_ORDER = ['a_acheter', 'a_lire', 'en_cours', 'termine'];

export const STATUS_CONFIG = {
  a_acheter: { label: 'À acheter', emoji: '🛒' },
  a_lire: { label: 'À lire', emoji: '🌱' },
  en_cours: { label: 'En cours', emoji: '🔁' },
  termine: { label: 'Terminés', emoji: '✅' },
};

// === Référence Firestore pour les livres d’un utilisateur ===
export function userBooksRef(userId) {
  return collection(db, 'users', userId, 'books');
}

// === Écoute temps réel des livres d’un user ===
export function listenUserBooks(userId, onBooks, onError) {
  const q = query(userBooksRef(userId), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onBooks(list);
    },
    (err) => {
      if (onError) onError(err);
      else console.error(err);
    }
  );
}

// === Sauvegarde (création ou update) d’un livre ===
export async function saveBook(userId, data, id = null) {
  const ref = userBooksRef(userId);
  const payload = {
    title: data.title || '',
    author: data.author || '',
    status: data.status || 'a_acheter',
    rating: data.rating || '',
    tags: data.tags || [],
    comment: data.comment || '',
    coverUrl: data.coverUrl || '',
    updatedAt: Date.now(),
  };

  if (id) {
    await updateDoc(doc(ref, id), payload);
  } else {
    await addDoc(ref, {
      ...payload,
      createdAt: Date.now(),
    });
  }
}

// === Suppression d’un livre ===
export async function deleteBook(userId, bookId) {
  await deleteDoc(doc(userBooksRef(userId), bookId));
}

// === Passage à la liste suivante ===
export async function cycleStatus(userId, book) {
  const currentIndex = STATUS_ORDER.indexOf(book.status || 'a_acheter');
  const next = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];

  await updateDoc(doc(userBooksRef(userId), book.id), {
    status: next,
    updatedAt: Date.now(),
  });
}

// === Recherche de livres (OpenLibrary) ===
export async function searchBooks(text) {
  if (!text || text.trim().length < 3) return [];

  const url =
    'https://openlibrary.org/search.json?' +
    new URLSearchParams({
      q: text.trim(),
      limit: '10',
    }).toString();

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  return (data.docs || []).map((d) => ({
    key: d.key,
    title: d.title,
    author_name: d.author_name,
    cover_i: d.cover_i,
    isbn: d.isbn,
  }));
}
