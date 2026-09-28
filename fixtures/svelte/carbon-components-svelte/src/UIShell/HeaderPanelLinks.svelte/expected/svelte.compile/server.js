import * as $ from 'svelte/internal/server';

export default function HeaderPanelLinks($$renderer, $$props) {
	$$renderer.push(`<ul${$.attr_class('', void 0, { 'bx--switcher__item': true })}><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></ul>`);
}