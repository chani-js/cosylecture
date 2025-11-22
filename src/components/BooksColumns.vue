<template>
  <div class="columns">
    <div
      v-for="(books, statusKey) in grouped"
      :key="statusKey"
      class="column"
    >
      <div class="column-header">
        <div class="column-title">
          {{ STATUS_CONFIG[statusKey].emoji }} {{ STATUS_CONFIG[statusKey].label }}
        </div>
        <div class="column-count">{{ books.length }} livre(s)</div>
      </div>

      <div v-if="books.length === 0" class="empty">
        Rien ici pour le moment ✨
      </div>

      <div
        v-for="book in books"
        :key="book.id"
        class="book-card"
      >
        <div class="book-main">
          <!-- Pochette -->
          <div v-if="book.coverUrl" class="book-cover">
            <img
              :src="book.coverUrl"
              :alt="`Pochette de ${book.title}`"
              loading="lazy"
            />
          </div>

          <!-- Texte -->
          <div class="book-text">
            <div class="book-title">{{ book.title }}</div>
            <div class="book-author">{{ book.author || "Auteur inconnu" }}</div>
          </div>

          <!-- Note -->
          <div class="book-meta" v-if="book.rating">
            <div class="stars">{{ starString(book.rating) }}</div>
          </div>
        </div>

        <!-- Meta tag + statut -->
        <div class="book-meta">
          <span class="pill-status">{{ STATUS_CONFIG[book.status].label }}</span>

          <span
            v-if="book.tags && book.tags.length"
            class="chip"
          >
            {{ book.tags.join(", ") }}
          </span>
        </div>

        <!-- Commentaire -->
        <div v-if="book.comment" class="book-comment">
          {{ book.comment }}
        </div>

        <!-- Actions -->
        <div class="book-actions">
          <button class="secondary" @click="$emit('edit', book)">Modifier</button>
          <button class="secondary" @click="$emit('change-status', book)">Changer de liste</button>
          <button class="secondary" @click="$emit('delete', book)">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
});

const emits = defineEmits(["edit", "delete", "change-status"]);

const STATUS_CONFIG = {
  a_acheter: { label: "À acheter", emoji: "🛒" },
  a_lire: { label: "À lire", emoji: "🌱" },
  en_cours: { label: "En cours", emoji: "🔁" },
  termine: { label: "Terminés", emoji: "✅" },
};

function starString(rating) {
  const full = "★".repeat(Math.floor(rating));
  const half = rating % 1 ? "½" : "";
  const empty = "☆".repeat(5 - Math.ceil(rating));
  return full + half + empty;
}

const grouped = computed(() => {
  const groups = {
    a_acheter: [],
    a_lire: [],
    en_cours: [],
    termine: [],
  };

  for (const book of props.books) {
    if (groups[book.status]) groups[book.status].push(book);
  }

  return groups;
});
</script>

<style scoped>
/* (Tu peux garder ton CSS existant, ici juste la structure) */
</style>
