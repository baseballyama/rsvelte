import * as $ from 'svelte/internal/server';

export default function Element_class_directive($$renderer, $$props) {
	let { tag, active } = $$props;
	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr_class('base', void 0, { 'active': active })}`);
	});
}
