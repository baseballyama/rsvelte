import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="layercake-layout-html svelte-1qrgjoi"><!></div>`);

export default function Html($$anchor, $$props) {
	$.push($$props, true);

	const $padding = () => $.store_get(padding, '$padding', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	let element = $.prop($$props, 'element', 15, undefined),
		zIndex = $.prop($$props, 'zIndex', 3, undefined),
		pointerEvents = $.prop($$props, 'pointerEvents', 3, undefined),
		role = $.prop($$props, 'role', 3, undefined),
		label = $.prop($$props, 'label', 3, undefined),
		labelledBy = $.prop($$props, 'labelledBy', 3, undefined),
		describedBy = $.prop($$props, 'describedBy', 3, undefined),
		overflow = $.prop($$props, 'overflow', 3, 'visible');

	let roleVal = $.derived(() => role() || (label() || labelledBy() || describedBy() ? 'figure' : undefined));
	var div = root();
	let styles;
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ element: element() }));
	$.reset(div);
	$.bind_this(div, ($$value) => element($$value), () => element());

	$.template_effect(() => {
		$.set_attribute(div, 'role', $.get(roleVal));
		$.set_attribute(div, 'aria-label', label());
		$.set_attribute(div, 'aria-labelledby', labelledBy());
		$.set_attribute(div, 'aria-describedby', describedBy());

		styles = $.set_style(div, '', styles, {
			'z-index': zIndex(),
			'pointer-events': pointerEvents() === false ? 'none' : null,
			top: $padding().top + 'px',
			right: $padding().right + 'px',
			bottom: $padding().bottom + 'px',
			left: $padding().left + 'px',
			overflow: overflow()
		});
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}