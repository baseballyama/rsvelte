import * as $ from 'svelte/internal/server';

export default function HeaderPanelDivider($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	if ($$slots.default) {
		$$renderer.push(`<!--[0--><li${$.attr_class('', void 0, { 'bx--header-panel-divider': true })}><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></li>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <li><hr${$.attr_class('', void 0, { 'bx--switcher__item--divider': true })}/></li>`);
}