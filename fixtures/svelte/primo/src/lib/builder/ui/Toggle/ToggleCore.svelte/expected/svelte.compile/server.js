import * as $ from 'svelte/internal/server';

export default function ToggleCore($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {any} [id] - Specify the id
		 * @property {boolean} [toggled] - Specify whether the toggle switch is toggled
		 * @property {boolean} [disabled] - Set to `true` to disable the button
		 * @property {import('svelte').Snippet<[any]>} [children]
		 */
		/** @type {Props & { [key: string]: any }} */
		let {
			id = 'toggle' + Math.random().toString(36),
			toggled = true,
			disabled = false,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let label = $.derived(() => ({ for: id }));

		let button = $.derived(() => ({
			...rest,
			id,
			disabled,
			'aria-checked': toggled,
			type: 'button',
			role: 'switch'
		}));

		children?.($$renderer, { label: label(), button: button() });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { toggled });
	});
}