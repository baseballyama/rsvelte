import * as $ from 'svelte/internal/server';

export default function Literal_slot01_output($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'name', {}, null);
	$$renderer.push(`<!--]-->`);
}