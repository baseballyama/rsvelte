import * as $ from 'svelte/internal/server';

export default function TextDecoration($$renderer) {
	$$renderer.push(`<p class="underline dark:text-gray-400">please read our terms and services</p> <p class="line-through dark:text-gray-400">please read our terms and services</p>`);
}