import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * @typedef {Object} Props
		 * @property {SVGElement|undefined} [element] The layout's `<svg>` element. A useful prop to bind to.
		 * @property {number|undefined} [zIndex] Set the layout's z-index.
		 * @property {boolean|undefined} [pointerEvents] Set this to `false` to set `pointer-events: none;` on all of this layout's layers.
		 * @property {string|undefined} [viewBox] Set a custom viewBox.
		 * @property {string|undefined} [label] A string passed to the `aria-label` on the `<svg>` element.
		 * @property {string|undefined} [labelledBy] A string passed to the `aria-labelledby` on the `<svg>` element.
		 * @property {string|undefined} [describedBy] A string passed to `aria-describedby` property on the `<svg>` element.
		 * @property {string|undefined} [titleText] Shorthand to set the contents of `<title></title>` for accessibility. You can also set arbitrary HTML via the "title" slot but this is a convenient shorthand. If you use the "title" slot, this prop is ignored.
		 * @property {'visible'|'hidden'} [overflow='visible'] Set the overflow property on the `<svg>` element. Defaults to `'visible'`.
		 * @property {import('svelte').Snippet} [title] A snippet to render inside the `<title>` tag for accessibility. If you use this, the `titleText` prop is ignored.
		 * @property {import('svelte').Snippet} [defs] A snippet to render inside the `<defs>` tag for accessibility.
		 * @property {import('svelte').Snippet<[{ element: SVGElement | undefined }]>} [children]
		 */
		/** @type {Props} */
		let {
			element = undefined,
			zIndex = undefined,
			pointerEvents = undefined,
			viewBox = undefined,
			label = undefined,
			labelledBy = undefined,
			describedBy = undefined,
			titleText = undefined,
			title = undefined,
			defs = undefined,
			overflow = 'visible',
			children
		} = $$props;

		const { containerWidth, containerHeight, padding } = getContext('LayerCake');

		$$renderer.push(`<svg class="layercake-layout-svg svelte-1q831g1"${$.attr('viewBox', viewBox)}${$.attr('width', $.store_get($$store_subs ??= {}, '$containerWidth', containerWidth))}${$.attr('height', $.store_get($$store_subs ??= {}, '$containerHeight', containerHeight))}${$.attr('aria-label', label)}${$.attr('aria-labelledby', labelledBy)}${$.attr('aria-describedby', describedBy)}${$.attr_style('', {
			'z-index': zIndex,
			'pointer-events': pointerEvents === false ? 'none' : null,
			top: $.store_get($$store_subs ??= {}, '$padding', padding).top + 'px',
			left: $.store_get($$store_subs ??= {}, '$padding', padding).left + 'px',
			width: `calc(100% - ${$.store_get($$store_subs ??= {}, '$padding', padding).left + $.store_get($$store_subs ??= {}, '$padding', padding).right}px)`,
			height: `calc(100% - ${$.store_get($$store_subs ??= {}, '$padding', padding).top + $.store_get($$store_subs ??= {}, '$padding', padding).bottom}px)`,
			overflow
		})}>`);

		if (typeof title === 'function') {
			$$renderer.push(`<!--[0--><title>`);
			title($$renderer);
			$$renderer.push(`<!----></title>`);
		} else if (titleText) {
			$$renderer.push(`<!--[1--><title>${$.escape(titleText)}</title>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if (typeof defs === 'function') {
			$$renderer.push(`<!--[0--><defs>`);
			defs($$renderer);
			$$renderer.push(`<!----></defs>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		children?.($$renderer, { element });
		$$renderer.push(`<!----></svg>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { element });
	});
}