import * as $ from 'svelte/internal/server';
import { getDropdown } from './context.ts';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

export default function DropdownContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className = '',
			children,
			align = 'start',
			side = 'bottom'
		} = $$props;

		const ctx = getDropdown();
		let element = null;

		function updatePosition() {
			if (!ctx.triggerEl || !element) return;

			const placement = `${side}${align !== 'center' ? '-' + align : ''}`;

			computePosition(ctx.triggerEl, element, {
				placement,
				middleware: [offset(4), flip(), shift({ padding: 8 })]
			}).then(({ x, y }) => {
				if (element) {
					element.style.left = `${x}px`;
					element.style.top = `${y}px`;
					element.style.visibility = 'visible';
				}
			});
		}

		if (ctx.open) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`edra-dropdown-content dropdown-content ${$.stringify(className)}`, 'svelte-1mu033d')} style="left: 0; top: 0; width: max-content; min-width: 8rem; visibility: hidden;" role="menu">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}