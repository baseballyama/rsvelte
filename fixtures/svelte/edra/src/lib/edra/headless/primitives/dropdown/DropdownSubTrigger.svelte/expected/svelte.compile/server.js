import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import ChevronRight from '@lucide/svelte/icons/chevron-right';

export default function DropdownSubTrigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className = '', children, openDelay = 300 } = $$props;
		const subCtx = getContext('edra-dropdown-sub');
		let element = null;
		let timeout;

		function handleMouseEnter() {
			clearTimeout(timeout);

			timeout = setTimeout(
				() => {
					subCtx.open = true;
				},
				openDelay
			);
		}

		function handleMouseLeave() {
			clearTimeout(timeout);

			timeout = setTimeout(
				() => {
					if (subCtx.contentEl && !subCtx.contentEl.matches(':hover')) {
						subCtx.open = false;
					}
				},
				100
			);
		}

		$$renderer.push(`<div role="menuitem" tabindex="0"${$.attr_class(`dropdown-subtrigger ${$.stringify(className)}`, 'svelte-vxnylo')}>`);
		children($$renderer);
		$$renderer.push(`<!----> `);
		ChevronRight($$renderer, { class: 'arrow-icon' });
		$$renderer.push(`<!----></div>`);
	});
}