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

    <section v-if="user" class="panel">
      <div class="panel-title">📚 Ta bibliothèque</div>

      <div class="library-toolbar">
        <div class="library-filters">
          <input
            type="text"
            v-model="searchText"
            placeholder="Rechercher par titre ou auteur…"
          />
          <select v-model="statusFilter">
            <option value="all">Tous les statuts</option>
            <option value="a_acheter">À acheter</option>
            <option value="a_lire">À lire</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminés</option>
          </select>
        </div>

        <div class="library-view-toggle">
          <button
            type="button"
            class="secondary"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            🗂 Vue cartes
          </button>
          <button
            type="button"
            class="secondary"
            :class="{ active: viewMode === 'kanban' }"
            @click="viewMode = 'kanban'"
          >
            🧱 Vue kanban
          </button>
        </div>
      </div>

      <!-- Vue cartes filtrée (idéal quand il y a beaucoup de livres) -->
      <div v-if="viewMode === 'grid'" class="books-grid">
        <p v-if="!filteredBooks.length" class="empty">
          Aucun livre ne correspond à la recherche pour le moment ✨
        </p>

        <article
          v-for="book in filteredBooks"
          :key="book.id"
          class="book-card book-card-row"
        >
          <div class="book-main">
            <div v-if="book.coverUrl" class="book-cover-wrapper">
              <img :src="book.coverUrl" alt="" class="book-cover" />
            </div>
            <div class="book-text">
              <div class="book-title">{{ book.title }}</div>
              <div class="book-author">
                {{ book.author || 'Auteur inconnu' }}
              </div>
            </div>
          </div>

          <div class="book-meta">
            <span v-if="book.rating" class="stars">
              {{ starString(book.rating) }}
            </span>
            <span class="pill-status">
              {{ statusConfig[book.status]?.label || 'Statut inconnu' }}
            </span>
            <span v-if="book.tags?.length" class="chip">
              {{ book.tags.join(', ') }}
            </span>
          </div>

          <div v-if="book.comment" class="book-comment">
            {{ book.comment }}
          </div>

          <div class="book-actions">
            <button
              class="secondary"
              type="button"
              @click="startEdit(book)"
            >
              Modifier
            </button>
            <button
              class="secondary"
              type="button"
              @click="handleCycleStatus(book)"
            >
              Changer de liste
            </button>
            <button
              class="secondary"
              type="button"
              @click="handleDeleteBook(book)"
            >
              Supprimer
            </button>
          </div>
        </article>
      </div>

      <!-- Vue Kanban traditionnelle -->
      <BooksColumns
        v-else
        :books="filteredBooks"
        @edit="startEdit"
        @cycle-status="handleCycleStatus"
        @delete="handleDeleteBook"
      />
    </section>

    <p v-if="!user" class="footer-note">
      Connecte-toi pour enregistrer et retrouver tes livres depuis n'importe où ✨
    </p>
    <p v-else class="footer-note">
      Tes livres sont sauvegardés en ligne, liés à ton compte 💛
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import AuthPanel from './components/AuthPanel.vue';
import BookForm from './components/BookForm.vue';
import BooksColumns from './components/BooksColumns.vue';
import {
  cycleStatus,
  deleteBook,
  saveBook,
  subscribeToBooks,
} from './services/booksService.js';

const user = ref(null);
const books = ref([]);
const editingBook = ref(null);

const viewMode = ref('grid'); // 'grid' ou 'kanban'
const searchText = ref('');
const statusFilter = ref('all');

const statusConfig = {
  a_acheter: { label: 'À acheter', emoji: '🛒' },
  a_lire: { label: 'À lire', emoji: '🌱' },
  en_cours: { label: 'En cours', emoji: '🔁' },
  termine: { label: 'Terminés', emoji: '✅' },
};

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
    unsubscribe = subscribeToBooks(u.uid, (items) => {
      books.value = items;
    });
  }
}

const filteredBooks = computed(() => {
  let list = [...books.value];

  if (statusFilter.value !== 'all') {
    list = list.filter((b) => b.status === statusFilter.value);
  }

  const q = searchText.value.trim().toLowerCase();
  if (q) {
    list = list.filter((b) => {
      const t = (b.title || '').toLowerCase();
      const a = (b.author || '').toLowerCase();
      return t.includes(q) || a.includes(q);
    });
  }

  return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
});

function startEdit(book) {
  editingBook.value = { ...book };
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearEditing() {
  editingBook.value = null;
}

async function handleSaveBook(book) {
  if (!user.value) return;
  await saveBook(user.value.uid, book);
  editingBook.value = null;
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

function starString(r) {
  const ratingNum = Number(r);
  if (!ratingNum) return '';
  const full = '★'.repeat(Math.floor(ratingNum));
  const half = ratingNum % 1 ? '½' : '';
  const empty = '☆'.repeat(5 - Math.ceil(ratingNum));
  return full + half + empty;
}
</script>
