<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from '../../i18n/index.js';

const { locale, supportedLocales, setLocale, t } = useI18n();

const isOpen = ref(false);
const rootEl = ref(null);

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

function choose(code) {
  setLocale(code);
  isOpen.value = false;
}

function handleOutsideClick(event) {
  if (rootEl.value && !rootEl.value.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
</script>

<template>
  <div ref="rootEl" class="relative">
    <button
      @click="toggleOpen"
      class="nav-action-btn nav-action-btn-neutral rounded-full"
      :title="t('app.language')"
      :aria-label="t('app.language')"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
    </button>

    <ul
      v-if="isOpen"
      role="listbox"
      class="absolute end-0 z-50 mt-2 min-w-[9rem] overflow-hidden rounded-lg border border-[var(--border-color,rgba(0,0,0,0.1))] bg-[var(--panel-bg,white)] py-1 shadow-lg"
    >
      <li v-for="item in supportedLocales" :key="item.code" role="option" :aria-selected="locale === item.code">
        <button
          type="button"
          @click="choose(item.code)"
          class="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-[var(--hover-bg,rgba(0,0,0,0.05))]"
          :class="{ 'font-semibold': locale === item.code }"
        >
          <span>{{ item.label }}</span>
          <span v-if="locale === item.code">✓</span>
        </button>
      </li>
    </ul>
  </div>
</template>
