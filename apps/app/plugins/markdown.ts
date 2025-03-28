import { defineNuxtPlugin } from '#app';
import MarkdownIt from 'markdown-it';

export default defineNuxtPlugin(() => {
  const mdRenderer = new MarkdownIt();

  return {
    provide: {
      mdRenderer,
    }
  };
}); 