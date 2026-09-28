import * as $ from 'svelte/internal/server';

export default function Step_one($$renderer, $$props) {
	let { label } = $$props;

	$$renderer.push(`<div class="w-full card bg-surface-100-900 p-10 space-y-2 text-center"><h2 class="h3">${$.escape(label)}</h2> <p>The component contents for <u>${$.escape(label)}</u>.</p></div>`);
}