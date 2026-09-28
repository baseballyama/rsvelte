import * as $ from 'svelte/internal/server';

export default function HeaderUtilities($$renderer, $$props) {
	$$renderer.push(`<div${$.attr_class('', void 0, { 'bx--header__global': true })}><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}