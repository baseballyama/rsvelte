import * as $ from 'svelte/internal/server';

export default function Named_slot01_input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'named', {}, null);
	$$renderer.push(`<!--]-->`);
}