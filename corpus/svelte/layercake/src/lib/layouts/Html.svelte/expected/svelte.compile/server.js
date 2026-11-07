import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { padding } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {HTMLElement|undefined} [element] The layout's outermost `<div>` element. A useful prop to bind to.
		 * @property {number|undefined} [zIndex] Set the layout's z-index.
		 * @property {boolean|undefined} [pointerEvents] Set this to `false` to set `pointer-events: none;` on all of this layout's layers.
		 * @property {string|undefined} [role] A string passed to the `aria-role` on the `<div>` element. This is `undefined` by default but will be set by default to `'figure'` if `label`, `labelledby` or `describedby` is set. That default will be overridden by whatever is passed in.
		 * @property {string|undefined} [label] A string passed to the `aria-label` on the `<div>` element.
		 * @property {string|undefined} [labelledBy] A string passed to the `aria-labelledby` on the `<div>` element.
		 * @property {string|undefined} [describedBy] A string passed to `aria-describedby` property on the `<div>` element.
		 * @property {'visible'|'hidden'} [overflow='visible'] Set the overflow property on the `<div>` element. Defaults to `'visible'`.
		 * @property {import('svelte').Snippet<[{ element: HTMLElement | undefined }]>} [children]
		 */
		/** @type {Props} */
		let {
			element = undefined,
			zIndex = undefined,
			pointerEvents = undefined,
			role = undefined,
			label = undefined,
			labelledBy = undefined,
			describedBy = undefined,
			overflow = 'visible',
			children
		} = $$props;

		let roleVal = $.derived(() => role || (label || labelledBy || describedBy ? 'figure' : undefined));

		$$renderer.push(`<div class="layercake-layout-html svelte-1qrgjoi"${$.attr('role', roleVal())}${$.attr('aria-label', label)}${$.attr('aria-labelledby', labelledBy)}${$.attr('aria-describedby', describedBy)}${$.attr_style('', {
			'z-index': zIndex,
			'pointer-events': pointerEvents === false ? 'none' : null,
			top: $.store_get($$store_subs ??= {}, '$padding', padding).top + 'px',
			right: $.store_get($$store_subs ??= {}, '$padding', padding).right + 'px',
			bottom: $.store_get($$store_subs ??= {}, '$padding', padding).bottom + 'px',
			left: $.store_get($$store_subs ??= {}, '$padding', padding).left + 'px',
			overflow
		})}>`);

		children?.($$renderer, { element });
		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { element });
	});
}