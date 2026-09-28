import * as $ from 'svelte/internal/server';
import { getDropdown } from './context.ts';

export default function DropdownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className = '', onclick, children } = $$props;
		const ctx = getDropdown();

		function handleKeydown(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onclick?.(new MouseEvent('click'));
				ctx.close();
			}
		}

		$$renderer.push(`<div role="menuitem" tabindex="0"${$.attr_class(`dropdown-item ${$.stringify(className)}`, 'svelte-v96tkx')}>`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}