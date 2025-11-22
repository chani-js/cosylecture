// src/services/booksService.js
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

export const STATUS_ORDER = ['a_acheter', 'a_lire', 'en_cours', 'termine'];

export const STATUS_CONFIG = {
  a_acheter: { label: 'À acheter', emoji: '🛒' },
  a_lire:    { label: 'À lire',    emoji: '🌱' },
  en_cours:  { label: 'En cours',  emoji: '🔁' },
  termine:   { label: 'Terminés',  emoji: '✅' },
};

function userBooksRef(userId) {
  return collection(doc(collection(db, 'users'), userId), 'books');
}

export function listenUserBooks(userId, callback, onError) {
  const q = query(userBooksRef(userId), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const books = [];
      snapshot.forEach((d) => books.push({ id: d.id, ...d.data() }));
      callback(books);
    },
    onError
  );
}

export async function saveBook(userId, data, bookId = null) {
  const ref = userBooksRef(userId);
  const now = Date.now();

  if (bookId) {
    await updateDoc(doc(ref, bookId), { ...data, updatedAt: now });
  } else {
    await addDoc(ref, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function deleteBook(userId, bookId) {
  await deleteDoc(doc(userBooksRef(userId), bookId));
}

export async function cycleStatus(userId, book) {
  const currentIndex = STATUS_ORDER.indexOf(book.status || 'a_acheter');
  const next = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];

  await updateDoc(doc(userBooksRef(userId), book.id), {
    status: next,
    updatedAt: Date.now(),
  });
}
