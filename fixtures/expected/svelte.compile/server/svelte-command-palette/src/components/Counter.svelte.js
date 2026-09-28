import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	let { counter = 0 } = $$props;

	$$renderer.push(`<div class="mt-8 py-16 shadow-md flex items-center justify-center text-6xl dark:bg-dark-mode-gray dark:text-light-gray">${$.escape(counter)}</div>`);
}