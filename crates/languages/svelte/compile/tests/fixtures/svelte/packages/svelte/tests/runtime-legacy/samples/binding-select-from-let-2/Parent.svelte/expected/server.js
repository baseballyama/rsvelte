import * as $ from 'svelte/internal/server';

export default function Parent($$renderer, $$props) {
	const tasks = ["do laundry", "do taxes", "cook food", "watch the kids"];

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', { tasks }, null);
	$$renderer.push(`<!--]-->`);
}