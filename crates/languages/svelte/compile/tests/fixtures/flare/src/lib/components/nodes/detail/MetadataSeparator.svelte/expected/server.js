import * as $ from 'svelte/internal/server';

export default function MetadataSeparator($$renderer, $$props) {
	let {} = $$props;

	$$renderer.push(`<hr class="border-gray-200 dark:border-gray-700"/>`);
}