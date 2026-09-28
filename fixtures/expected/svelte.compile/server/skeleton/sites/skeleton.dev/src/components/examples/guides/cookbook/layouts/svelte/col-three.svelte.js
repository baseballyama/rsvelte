import * as $ from 'svelte/internal/server';

export default function Col_three($$renderer) {
	$$renderer.push(`<div class="w-full"><header class="preset-filled-primary-500 p-4">(header)</header> <div class="grid grid-cols-1 md:grid-cols-[auto_1fr_auto]"><aside class="preset-filled-success-500 p-4">(sidebar)</aside> <main class="preset-filled-secondary-500 p-4 space-y-4"><p class="preset-filled-warning-500 p-4">Paragraph 1</p> <p class="preset-filled-warning-500 p-4">Paragraph 2</p> <p class="preset-filled-warning-500 p-4">Paragraph 3</p></main> <aside class="preset-filled-success-500 p-4">(sidebar)</aside></div> <footer class="preset-filled-tertiary-500 p-4">(footer)</footer></div>`);
}