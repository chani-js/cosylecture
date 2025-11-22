<template>
  <section class="columns">
    <div
      v-for="(list, status) in grouped"
      :key="status"
      class="column"
    >
      <div class="column-header">
        <div class="column-title">
          {{ STATUS[status].emoji }} {{ STATUS[status].label }}
        </div>
        <div class="column-count">{{ list.length }} livre(s)</div>
      </div>

      <div v-if="list.length === 0" class="empty">
        Rien ici pour le moment ✨
      </div>

      <div
        v-for="book in list"
        :key="book.id"
        class="book-card"
      >
        <div class="book-main">
          <div v-if="book.coverUrl" class="book-cover">
            <img :src="book.coverUrl" :alt="book.title" />
          </div>

          <div class="book-text">
            <div class="book-title">{{ book.title }}</div>
            <div class="book-author">{{ book.author }}</div>
          </div>

          <div class="book-meta" v-if="book.rating">
            <div class="stars">{{ starString(book.rating) }}</div>
          </div>
        </div>

        <div class="book-meta">
          <span class="pill-status">{{ STATUS[book.status].label }}</span>
          <span v-if="book.tags.length" class="chip">
            {{ book.tags.join(', ') }}
          </span>
        </div>

        <div v-if="book.comment" class="book-comment">
          {{ book.comment }}
        </div>

        <div class="book-actions">
          <button class="secondary" @click="$emit('edit', book)">Modifier</button>
          <button class="secondary" @click="$emit('move', book)">Changer de liste</button>
          <button class="secondary" @click="$emit('delete', book)">Supprimer</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  grouped: Object
});

const STATUS = {
  a_acheter: { label: "À acheter", emoji: "🛒" },
  a_lire: { label: "À lire", emoji: "🌱" },
  en_cours: { label: "En cours", emoji: "🔁" },
  termine: { label: "Terminés", emoji: "✅" }
};

function starString(r) {
  r = Number(r);
  const f = "★".repeat(Math.floor(r));
  const h = r % 1 ? "½" : "";
  const e = "☆".repeat(5 - Math.ceil(r));
  return f + h + e;
}
</scr
