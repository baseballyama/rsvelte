import * as $ from 'svelte/internal/server';

export default function TabList($$renderer, $$props) {
	$$renderer.push(`<div class="tab-list"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}