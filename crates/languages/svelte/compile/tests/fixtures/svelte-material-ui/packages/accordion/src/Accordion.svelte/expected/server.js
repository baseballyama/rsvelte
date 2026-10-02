import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

export default function Accordion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Whether multiple panels can be open at once.
		 */
		let {
			use = [],
			class: className = '',
			multiple = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let panelAccessorSet = new Set();
		let withOpenDialog = false;

		setContext('SMUI:accordion:panel:mount', (accessor) => {
			if (!multiple && accessor.open) {
				const currentOpen = Array.from(panelAccessorSet).find((accessor) => accessor.open);

				if (currentOpen) {
					currentOpen.setOpen(false);
				}
			}

			panelAccessorSet.add(accessor);
		});

		setContext('SMUI:accordion:panel:unmount', (accessor) => {
			// Nested check.
			if (!panelAccessorSet.has(accessor)) {
				return;
			}

			panelAccessorSet.delete(accessor);
		});

		function handlePanelActivate(event) {
			const { accessor } = event.detail;

			// Nested check.
			if (!panelAccessorSet.has(accessor)) {
				return;
			}

			if (!multiple && !accessor.open) {
				const currentOpen = Array.from(panelAccessorSet).find((accessor) => accessor.open);

				if (currentOpen) {
					currentOpen.setOpen(false);
				}
			}

			accessor.setOpen(!accessor.open);
		}

		function handlePanelOpening(event) {
			const { accessor } = event.detail;

			// Nested check.
			if (!panelAccessorSet.has(accessor)) {
				return;
			}

			if (!multiple) {
				const otherOpen = Array.from(panelAccessorSet).filter((checkAccessor) => checkAccessor !== accessor && checkAccessor.open);

				otherOpen.forEach((accessor) => accessor.setOpen(false));
			}
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'smui-accordion': true,
				'smui-accordion--multiple': multiple,
				'smui-accordion--with-open-dialog': withOpenDialog,
				[className]: true
			})),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { getElement });
	});
}