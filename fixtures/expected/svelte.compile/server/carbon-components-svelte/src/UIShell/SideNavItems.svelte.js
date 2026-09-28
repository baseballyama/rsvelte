import * as $ from 'svelte/internal/server';

export default function SideNavItems($$renderer, $$props) {
	$$renderer.push(`<ul${$.attr_class('', void 0, { 'bx--side-nav__items': true })}><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></ul>`);
}