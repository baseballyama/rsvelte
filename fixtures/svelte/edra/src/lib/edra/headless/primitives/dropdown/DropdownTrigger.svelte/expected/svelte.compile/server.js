import * as $ from 'svelte/internal/server';
import { getDropdown } from './context.ts';

export default function DropdownTrigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className = '', children, title } = $$props;
		const ctx = getDropdown();
		let element = null;

		function handleKeydown(e) {
			if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				ctx.open = true;
			}
		}

		$$renderer.push(`<button type="button"${$.attr_class(`edra-btn edra-btn-ghost edra-btn-icon ${$.stringify(className)}`)}${$.attr('title', title)} aria-haspopup="menu"${$.attr('aria-expanded', ctx.open)}>`);
		children($$renderer);
		$$renderer.push(`<!----></button>`);
	});
}