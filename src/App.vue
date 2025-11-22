<!-- src/App.vue -->
<template>
  <div class="app">
    <header>
      <h1>📖 Coin lecture cosy</h1>
      <p>Un petit coin pour suivre ses lectures, partout où l'on se connecte.</p>
    </header>

    <AuthPanel @user-changed="onUserChanged" />

    <BookForm
      v-if="user"
      :editing-book="editingBook"
      @save="handleSaveBook"
      @cancel-edit="clearEditing"
    />

    <BooksColumns
      v-if="user"
      :books="books"
      @edit="startEditing"
      @delete="handleDeleteBook"
      @change-status="handleCycleStatus"
    />
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';
import AuthPanel from './components/AuthPanel.vue';
import BookForm from './components/BookForm.vue';
import BooksColumns from './components/BooksColumns.vue';
import {
  listenUserBooks,
  saveBook,
  deleteBook,
  cycleStatus,
} from './services/booksService';

const user = ref(null);
const books = ref([]);
const editingBook = ref(null);
let unsubscribe = null;

function onUserChanged(u) {
  user.value = u;
  editingBook.value = null;
  books.value = [];

  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  if (u) {
    unsubscribe = listenUserBooks(
      u.uid,
      (list) => (books.value = list),
      (err) => console.error('Erreur Firestore', err)
    );
  }
}

function startEditing(book) {
  editingBook.value = { ...book };
}

function clearEditing() {
  editingBook.value = null;
}

async function handleSaveBook(payload) {
  if (!user.value) return;

  await saveBook(
    user.value.uid,
    {
      title: payload.title,
      author: payload.author,
      status: payload.status,
      rating: payload.rating,
      tags: payload.tags,
      comment: payload.comment,
      coverUrl: payload.coverUrl,
    },
    payload.id
  );

  clearEditing();
}

async function handleDeleteBook(book) {
  if (!user.value) return;
  if (!confirm('Supprimer ce livre ?')) return;
  await deleteBook(user.value.uid, book.id);
}

async function handleCycleStatus(book) {
  if (!user.value) return;
  await cycleStatus(user.value.uid, book);
}

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe();
});
</script>
