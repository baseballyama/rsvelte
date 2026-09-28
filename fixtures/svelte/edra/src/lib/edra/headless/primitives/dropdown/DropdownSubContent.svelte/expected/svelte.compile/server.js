import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

export default function DropdownSubContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className = '', children } = $$props;
		const subCtx = getContext('edra-dropdown-sub');
		let element = null;

		function updatePosition() {
			if (!subCtx.triggerEl || !element) return;

			computePosition(subCtx.triggerEl, element, {
				placement: 'right-start',
				middleware: [offset(4), flip(), shift({ padding: 8 })]
			}).then(({ x, y }) => {
				if (element) {
					element.style.left = `${x}px`;
					element.style.top = `${y}px`;
					element.style.visibility = 'visible';
				}
			});
		}

		let timeout;

		function handleMouseLeave() {
			clearTimeout(timeout);

			timeout = setTimeout(
				() => {
					if (subCtx.triggerEl && !subCtx.triggerEl.matches(':hover')) {
						subCtx.open = false;
					}
				},
				100
			);
		}

		if (subCtx.open) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`edra-dropdown-content dropdown-subcontent ${$.stringify(className)}`, 'svelte-1rd6k5p')} style="left: 0; top: 0; width: max-content; min-width: 8rem; visibility: hidden;" role="menu" tabindex="-1">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}