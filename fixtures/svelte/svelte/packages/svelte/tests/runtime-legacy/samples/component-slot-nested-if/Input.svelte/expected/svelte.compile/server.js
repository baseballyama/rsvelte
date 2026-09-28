import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let val;

	$$renderer.push(`<input${$.attr('value', val)}/> <!--[-->`);
	$.slot($$renderer, $$props, 'default', { val }, null);
	$$renderer.push(`<!--]-->`);
}