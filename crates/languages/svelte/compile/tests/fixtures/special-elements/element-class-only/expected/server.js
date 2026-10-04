import * as $ from 'svelte/internal/server';

export default function Element_class_only($$renderer, $$props) {
	let { tag, active } = $$props;
	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attr_class('', void 0, { 'active': active })}`);
	});
}
