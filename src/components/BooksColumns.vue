<!-- src/components/BooksColumns.vue -->
<template>
  <div class="columns">
    <div
      v-for="(booksByStatus, statusKey) in grouped"
      :key="statusKey"
      class="column"
    >
      <div class="column-header">
        <div class="column-title">
          {{ STATUS_CONFIG[statusKey].emoji }}
          {{ STATUS_CONFIG[statusKey].label }}
        </div>
        <div class="column-count">
          {{ booksByStatus.length }} livre(s)
        </div>
      </div>

      <div v-if="booksByStatus.length === 0" class="empty">
        Rien ici pour le moment ✨
      </div>

      <article
        v-for="book in booksByStatus"
        :key="book.id"
        class="book-card"
      >
        <div class="book-main">
          <div class="book-text">
            <div class="book-title">{{ book.title }}</div>
            <div class="book-author">
              {{ book.author || 'Auteur inconnu' }}
            </div>
          </div>

          <div class="book-meta">
            <div v-if="book.rating" class="stars">
              {{ makeStars(book.rating) }}
            </div>
          </div>
        </div>

        <div class="book-meta">
          <span class="pill-status">
            {{ STATUS_CONFIG[book.status].label }}
          </span>
          <span
            v-if="book.tags && book.tags.length"
            class="chip"
          >
            {{ book.tags.join(', ') }}
          </span>
        </div>

        <div
          v-if="book.coverUrl"
          class="cover-preview-wrapper"
        >
          <img :src="book.coverUrl" class="cover-preview" />
        </div>

        <div v-if="book.comment" class="book-comment">
          {{ book.comment }}
        </div>

        <div class="book-actions">
          <button class="secondary" @click="$emit('edit', book)">
            Modifier
          </button>
          <button class="secondary" @click="$emit('change-status', book)">
            Changer de liste
          </button>
          <button class="secondary" @click="$emit('delete', book)">
            Supprimer
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { STATUS_CONFIG } from '../services/booksService';

const props = defineProps({
  books: {
    type: Array,
    default: () => [],
  },
});

const grouped = computed(() => {
  const groups = {
    a_acheter: [],
    a_lire: [],
    en_cours: [],
    termine: [],
  };

  for (const book of props.books) {
    if (groups[book.status]) {
      groups[book.status].push(book);
    }
  }
  return groups;
});

function makeStars(rating) {
  const n = Number(rating) || 0;
  const full = '★'.repeat(Math.floor(n));
  const empty = '☆'.repeat(5 - Math.floor(n));
  return full + empty;
}
</script>
