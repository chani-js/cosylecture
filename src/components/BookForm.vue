<!-- src/components/BookForm.vue -->
<template>
  <section class="panel">
    <div class="panel-title">➕ Ajouter ou modifier un livre</div>

    <form @submit.prevent="handleSubmit" class="book-form">
      <input type="hidden" v-model="form.id" />

      <!-- Titre + suggestions -->
      <div class="field">
        <label for="title">Titre *</label>
        <input
          id="title"
          type="text"
          required
          v-model="form.title"
          @input="onTitleInput"
          placeholder="Ex : Dune"
        />
        <ul v-if="titleSuggestions.length" class="suggestions">
          <li
            v-for="s in titleSuggestions"
            :key="s.key || s.cover_edition_key || s.title"
            @click="applySuggestion(s)"
          >
            {{ s.title }}
            <span v-if="s.author_name?.length">
              ({{ s.author_name[0] }})
            </span>
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
        <input
          id="rating"
          type="number"
          min="0"
          max="5"
          step="0.5"
          v-model="form.rating"
        />
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
      <div class="field full-row">
        <label for="comment">Commentaire</label>
        <textarea id="comment" v-model="form.comment"></textarea>
      </div>

      <!-- Pochette -->
      <div class="field full-row">
        <label for="coverUrl">Pochette (URL)</label>
        <input
          id="coverUrl"
          type="url"
          v-model="form.coverUrl"
          placeholder="https://.../image.jpg"
        />
        <div v-if="form.coverUrl" class="cover-preview-wrapper">
          <img
            :src="form.coverUrl"
            alt="Pochette du livre"
            class="cover-preview"
          />
        </div>
      </div>

      <div class="actions full-row">
        <button
          v-if="form.id"
          type="button"
          class="secondary"
          @click="onCancel"
        >
          Annuler
        </button>
        <button type="submit" class="primary">
          💾 Enregistrer
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { searchBooks } from '../services/booksService.js';

const props = defineProps({
  editingBook: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['save', 'cancel-edit']);

function createEmptyForm() {
  return {
    id: null,
    title: '',
    author: '',
    status: 'a_acheter',
    rating: '',
    tags: [],
    comment: '',
    coverUrl: '',
  };
}

const form = reactive(createEmptyForm());
const tagsInput = ref('');
const titleSuggestions = ref([]);
let suggestionTimeout = null;

// Mise à jour du formulaire quand on choisit un livre à éditer
watch(
  () => props.editingBook,
  (val) => {
    if (val) {
      Object.assign(form, createEmptyForm(), val, {
        tags: val.tags || [],
      });
      tagsInput.value = (form.tags || []).join(', ');
    } else {
      Object.assign(form, createEmptyForm());
      tagsInput.value = '';
      titleSuggestions.value = [];
    }
  },
  { immediate: true }
);

function updateTags() {
  form.tags = tagsInput.value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

async function fetchSuggestions(q) {
  const results = await searchBooks(q);
  titleSuggestions.value = results.slice(0, 8);
}

function onTitleInput() {
  titleSuggestions.value = [];
  const q = form.title.trim();
  if (q.length < 3) return;
  if (suggestionTimeout) clearTimeout(suggestionTimeout);
  suggestionTimeout = setTimeout(() => {
    fetchSuggestions(q);
  }, 300);
}

function applySuggestion(s) {
  form.title = s.title;
  if (s.author_name?.length) {
    form.author = s.author_name[0];
  }

  // Tentative d'ajouter la pochette automatiquement
  if (s.cover_i) {
    form.coverUrl = `https://covers.openlibrary.org/b/id/${s.cover_i}-M.jpg`;
  } else if (s.isbn?.length) {
    form.coverUrl = `https://covers.openlibrary.org/b/isbn/${s.isbn[0]}-M.jpg`;
  }

  titleSuggestions.value = [];
}

function handleSubmit() {
  if (!form.title.trim()) {
    alert('Le titre est obligatoire.');
    return;
  }
  emit('save', { ...form, tags: [...(form.tags || [])] });
}

function onCancel() {
  emit('cancel-edit');
}
</script>
