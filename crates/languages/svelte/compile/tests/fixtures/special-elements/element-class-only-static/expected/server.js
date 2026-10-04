import * as $ from 'svelte/internal/server';

export default function Element_class_only_static($$renderer) {
	const active = true;
	$.element($$renderer, 'div', () => {
		$$renderer.push(`${$.attr_class('', void 0, { 'active': active })}`);
	});
}
