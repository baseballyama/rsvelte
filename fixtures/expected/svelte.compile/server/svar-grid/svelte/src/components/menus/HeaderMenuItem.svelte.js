import * as $ from 'svelte/internal/server';

export default function HeaderMenuItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item } = $$props;

		$$renderer.push(`<div tabindex="-1" role="menuitem"${$.attr('aria-label', item.hidden
			? `Show ${item.text} column`
			: `Hide ${item.text} column`)}><div${$.attr_class('wx-icon svelte-1v2bw4o', void 0, { 'wx-hidden': !!item.hidden })}><i class="wxi-eye"></i></div> <span>${$.escape(item.text)}</span></div>`);
	});
}