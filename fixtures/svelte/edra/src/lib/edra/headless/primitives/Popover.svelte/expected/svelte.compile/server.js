import * as $ from 'svelte/internal/server';
import { onMount, tick } from 'svelte';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

export default function Popover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			side = 'bottom',
			align = 'center',
			children,
			trigger,
			portalProps,
			class: className = ''
		} = $$props;

		let triggerEl = null;
		let popoverEl = null;

		function updatePosition() {
			if (!triggerEl || !popoverEl) return;

			const placement = `${side}${align !== 'center' ? '-' + align : ''}`;

			computePosition(triggerEl, popoverEl, {
				placement,
				middleware: [offset(6), flip(), shift({ padding: 8 })]
			}).then(({ x, y }) => {
				if (popoverEl) {
					popoverEl.style.left = `${x}px`;
					popoverEl.style.top = `${y}px`;
				}
			});
		}

		function handleOutsideClick(event) {
			if (!open) return;

			const target = event.target;

			if (triggerEl && !triggerEl.contains(target) && popoverEl && !popoverEl.contains(target)) {
				open = false;
			}
		}

		$$renderer.push(`<div class="popover-wrapper svelte-dbdywc"><button type="button">`);
		trigger($$renderer);
		$$renderer.push(`<!----></button> `);

		if (open) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`edra-popover-content ${$.stringify(className)}`, 'svelte-dbdywc')} style="position: fixed; width: max-content; left: 0; top: 0;">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { open });
	});
}