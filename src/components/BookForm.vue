<!-- src/components/BookForm.vue -->
<template>
  <section class="panel">
    <div class="panel-title">➕ Ajouter ou modifier un livre</div>

    <form @submit.prevent="handleSubmit" class="book-form">
      <input type="hidden" v-model="form.id" />

      <div class="field">
        <label for="title">Titre *</label>
        <input
          id="title"
          type="text"
          required
          v-model="form.title"
          @input="onTitleInput"
          autocomplete="off"
        />
        <!-- Suggestions simples -->
        <ul v-if="titleSuggestions.length" class="suggestions">
          <li
            v-for="s in titleSuggestions"
            :key="s.key"
            @click="applySuggestion(s)"
          >
            {{ s.title }} <span v-if="s.author_name?.length">— {{ s.author_name[0] }}</span>
          </li>
        </ul>
      </div>

      <div class="field">
        <label for="author">Auteur</label>
        <input id="author" type="text" v-model="form.author" />
      </div>

      <div class="field">
        <label for="status">Statut</label>
        <select id="status" v-model="form.status">
          <option value="a_acheter">À acheter</option>
          <option value="a_lire">À lire</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
        </select>
      </div>

      <div class="field">
        <label for="rating">Note (/5)</label>
        <input id="rating" type="number" min="0" max="5" step="0.5" v-model="form.rating" />
      </div>

      <div class="field">
        <label for="tags">Tags (séparés par des virgules)</label>
        <input id="tags" type="text" v-model="form.tagsInput" />
      </div>

      <div class="field full-row">
        <label for="comment">Commentaire</label>
        <textarea id="comment" v-model="form.comment"></textarea>
      </div>

      <div class="actions full-row">
        <button
          type="button"
          class="secondary"
          v-if="form.id"
          @click="resetForm"
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
import { reactive, watch, ref } from 'vue';

const props = defineProps({
  editingBook: { type: Object, default: null },
});
const emit = defineEmits(['save', 'cancel-edit']);

// formulaire réactif
const form = reactive({
  id: null,
  title: '',
  author: '',
  status: 'a_acheter',
  rating: '',
  tagsInput: '',
  comment: '',
});

// suggestions titres (Open Library)
const titleSuggestions = ref([]);
let suggestionTimeout = null;

watch(
  () => props.editingBook,
  (book) => {
    if (book) {
      form.id = book.id;
      form.title = book.title || '';
      form.author = book.author || '';
      form.status = book.status || 'a_acheter';
      form.rating = book.rating || '';
      form.tagsInput = (book.tags || []).join(', ');
      form.comment = book.comment || '';
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  form.id = null;
  form.title = '';
  form.author = '';
  form.status = 'a_acheter';
  form.rating = '';
  form.tagsInput = '';
  form.comment = '';
  titleSuggestions.value = [];
  emit('cancel-edit');
}

function handleSubmit() {
  if (!form.title.trim()) return;

  const tags = form.tagsInput
    ? form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  emit('save', {
    id: form.id || null,
    title: form.title.trim(),
    author: form.author.trim(),
    status: form.status,
    rating: form.rating || '',
    tags,
    comment: form.comment.trim(),
  });

  if (!form.id) {
    resetForm();
  }
}

// suggestions basées sur Open Library (simple)
async function fetchSuggestions(query) {
  try {
    const url = `https://openlibrary.org/search.json?limit=5&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    titleSuggestions.value = (data.docs || []).map((d) => ({
      key: d.key,
      title: d.title,
      author_name: d.author_name,
    }));
  } catch (e) {
    console.error(e);
  }
}

function onTitleInput() {
  titleSuggestions.value = [];
  const q = form.title.trim();
  if (suggestionTimeout) clearTimeout(suggestionTimeout);
  if (q.length < 3) return;

  suggestionTimeout = setTimeout(() => {
    fetchSuggestions(q);
  }, 300);
}

function applySuggestion(s) {
  form.title = s.title;
  if (s.author_name?.length) {
    form.author = s.author_name[0];
  }
  titleSuggestions.value = [];
}
</script>
