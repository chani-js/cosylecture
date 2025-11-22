import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

// Référence utilisateur → books/
export function userBooksRef(userId) {
  return collection(db, "users", userId, "books");
}

// Recherche OpenLibrary
export async function searchBooks(text) {
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(text)}&limit=6`
    );
    const data = await res.json();
    return data.docs || [];
  } catch (_) {
    return [];
  }
}

// Sauvegarde (add ou update)
export async function saveBook(userId, book) {
  const ref = userBooksRef(userId);

  const payload = {
    title: book.title,
    author: book.author,
    status: book.status,
    rating: book.rating || "",
    tags: book.tags || [],
    comment: book.comment || "",
    coverUrl: book.coverUrl || "",
    updatedAt: Date.now(),
  };

  if (book.id) {
    await updateDoc(doc(ref, book.id), payload);
  } else {
    await addDoc(ref, {
      ...payload,
      createdAt: Date.now(),
    });
  }
}

// Suppression
export async function deleteBook(userId, id) {
  const ref = userBooksRef(userId);
  await deleteDoc(doc(ref, id));
}

// Passage à la liste suivante
export async function cycleStatus(userId, book) {
  const order = ["a_acheter", "a_lire", "en_cours", "termine"];
  const next = order[(order.indexOf(book.status) + 1) % order.length];

  const ref = userBooksRef(userId);
  await updateDoc(doc(ref, book.id), {
    status: next,
    updatedAt: Date.now(),
  });
}
