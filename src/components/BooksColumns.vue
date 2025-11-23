<!-- src/components/BooksColumns.vue -->
<template>
  <section class="columns">
    <div
      v-for="statusKey in statusKeys"
      :key="statusKey"
      class="column"
    >
      <div class="column-header">
        <div class="column-title">
          {{ statusConfig[statusKey].emoji }} {{ statusConfig[statusKey].label }}
        </div>
        <div class="column-count">
          {{ (grouped[statusKey]?.length || 0) }} livre(s)
        </div>
      </div>

      <div v-if="!grouped[statusKey]?.length" class="empty">
        Rien ici pour le moment ✨
      </div>

      <article
        v-for="book in grouped[statusKey]"
        :key="book.id"
        class="book-card"
      >
        <div class="book-main">
          <div
            v-if="book.coverUrl"
            class="book-cover-wrapper"
          >
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
            @click="$emit('edit', book)"
          >
            Modifier
          </button>
          <button
            class="secondary"
            type="button"
            @click="$emit('cycle-status', book)"
          >
            Changer de liste
          </button>
          <button
            class="secondary"
            type="button"
            @click="$emit('delete', book)"
          >
            Supprimer
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
});

const statusConfig = {
  a_acheter: { label: 'À acheter', emoji: '🛒' },
  a_lire: { label: 'À lire', emoji: '🌱' },
  en_cours: { label: 'En cours', emoji: '🔁' },
  termine: { label: 'Terminés', emoji: '✅' },
};

const statusKeys = Object.keys(statusConfig);

const grouped = computed(() => {
  const res = {
    a_acheter: [],
    a_lire: [],
    en_cours: [],
    termine: [],
  };
  for (const b of props.books) {
    if (res[b.status]) {
      res[b.status].push(b);
    }
  }
  return res;
});

function starString(r) {
  const ratingNum = Number(r);
  if (!ratingNum) return '';
  const full = '★'.repeat(Math.floor(ratingNum));
  const half = ratingNum % 1 ? '½' : '';
  const empty = '☆'.repeat(5 - Math.ceil(ratingNum));
  return full + half + empty;
}
</script>
