import * as $ from 'svelte/internal/server';

export default function Slide($$renderer) {
	$$renderer.push(`<p class="mt-8 text-6xl font-bold">🪄 Animotion</p> <p class="mt-16 text-3xl">Learn more by reading the <a class="underline" href="https://animotion.pages.dev/docs" target="_blank">Animotion docs</a>.</p>`);
}