import * as $ from 'svelte/internal/server';

export default function Display($$renderer, $$props) {
	$$renderer.push(`<!---->Display: <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}