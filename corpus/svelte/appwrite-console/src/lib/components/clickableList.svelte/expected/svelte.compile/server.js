import * as $ from 'svelte/internal/server';

export default function ClickableList($$renderer, $$props) {
	$$renderer.push(`<ul class="clickable-list"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></ul>`);
}