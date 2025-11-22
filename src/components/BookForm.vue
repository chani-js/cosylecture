<template>
  <section class="panel">
    <div class="panel-title">➕ Ajouter ou modifier un livre</div>

    <form @submit.prevent="submitForm" id="book-form">
      <!-- Champ caché pour l'id -->
      <input type="hidden" v-model="form.id" />

      <!-- Titre -->
      <div class="field">
        <label for="title">Titre *</label>
        <input
          id="title"
          type="text"
          v-model="form.title"
          @input="searchSuggestions"
          placeholder="Ex : Dune"
          required
        />
        <ul v-if="suggestions.length" class="suggestions">
          <li v-for="s in suggestions" :key="s.key" @click="applySuggestion(s)">
            {{ s.title }} <span v-if="s.author_name">({{ s.author_name[0] }})</span>
          </li>
        </ul>
      </div>

      <!-- Auteur -->
      <div class="field">
        <label for="author">Auteur</label>
        <input id="author" type="text" v-model="form.author" />
      </div>

      <!-- Statut -->
      <div class="field">
        <label for="status">Statut</label>
        <select id="status" v-model="form.status">
          <option value="a_acheter">À acheter</option>
          <option value="a_lire">À lire</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
        </select>
      </div>

      <!-- Note -->
      <div class="field">
        <label for="rating">Note (/5)</label>
        <input id="rating" type="number" min="0" max="5" step="0.5" v-model="form.rating" />
      </div>

      <!-- Tags -->
      <div class="field">
        <label for="tags">Tags</label>
        <input
          id="tags"
          type="text"
          v-model="tagsInput"
          @change="updateTags"
          placeholder="fantasy, cosy…"
        />
      </div>

      <!-- Commentaire -->
      <div class="field" style="grid-column:1 / -1;">
        <label for="comment">Commentaire</label>
        <textarea id="comment" v-model="form.comment"></textarea>
      </div>

      <!-- Pochette -->
      <div class="field" style="grid-column:1 / -1;">
        <label for="coverUrl">Pochette (URL)</label>
        <input
          id="coverUrl"
          type="url"
          v-model="form.coverUrl"
          placeholder="https://.../image.jpg"
        />

        <div v-if="form.coverUrl" class="cover-preview-wrapper">
          <img :src="form.coverUrl" class="cover-preview" />
        </div>
      </div>

      <div class="actions" style="grid-column:1 / -1;">
        <button v-if="form.id" type="button" class="secondary" @click="resetForm">
          Annuler
        </button>
        <button type="submit" class="primary">💾 Enregistrer</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { searchBooks } from '@/services/booksServices.js';

const props = defineProps({
  editingBook: Object
});

const emit = defineEmits(['save', 'cancel']);

const form = reactive({
  id: props.editingBook?.id || null,
  title: props.editingBook?.title || '',
  author: props.editingBook?.author || '',
  status: props.editingBook?.status || 'a_acheter',
  rating: props.editingBook?.rating || '',
  tags: props.editingBook?.tags || [],
  comment: props.editingBook?.comment || '',
  coverUrl: props.editingBook?.coverUrl || '',
});

const tagsInput = ref(form.tags.join(', '));
const suggestions = ref([]);

async function searchSuggestions() {
  if (form.title.length < 3) return (suggestions.value = []);
  suggestions.value = await searchBooks(form.title);
}

function updateTags() {
  form.tags = tagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

function applySuggestion(s) {
  form.title = s.title;
  if (s.author_name?.length) form.author = s.author_name[0];

  // Ajout de la pochette OpenLibrary
  if (s.cover_i) {
    form.coverUrl = `https://covers.openlibrary.org/b/id/${s.cover_i}-M.jpg`;
  } else if (s.isbn?.length) {
    form.coverUrl = `https://covers.openlibrary.org/b/isbn/${s.isbn[0]}-M.jpg`;
  }

  suggestions.value = [];
}

function submitForm() {
  emit('save', { ...form });
}

function resetForm() {
  emit('cancel');
}
</script>

<style scoped>
.suggestions {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 4px;
  list-style: none;
  padding: 4px;
  max-height: 140px;
  overflow: auto;
}

.suggestions li {
  padding: 6px;
  cursor: pointer;
}

.suggestions li:hover {
  background: #f3eae6;
}

.cover-preview-wrapper {
  margin-top: 6px;
}

.cover-preview {
  height: 110px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
</style>
