import * as $ from 'svelte/internal/server';

export default function Element_class_memo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { tag, active } = $$props;
		$.element($$renderer, tag, () => {
			$$renderer.push(`${$.attr_class('base', void 0, { 'active': active() })}`);
		});
	});
}
