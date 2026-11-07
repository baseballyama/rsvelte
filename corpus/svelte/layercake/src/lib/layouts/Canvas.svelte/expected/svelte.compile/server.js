import * as $ from 'svelte/internal/server';
import { getContext, onMount, setContext } from 'svelte';
import { writable } from 'svelte/store';
import scaleCanvas from '../lib/scaleCanvas.js';

export default function Canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { width, height, padding } = getContext('LayerCake');

		/**
		 * @typedef {Object} Props
		 * @property {HTMLCanvasElement|undefined} [element] The `<canvas>` element. A useful prop to bind to.
		 * @property {CanvasRenderingContext2D|null} [context] The 2D rendering context for the canvas. A useful prop to bind to.
		 * @property {number|undefined} [zIndex] Set the layout's z-index.
		 * @property {boolean|undefined} [pointerEvents] Set this to `false` to set `pointer-events: none;` on all of this layout's layers.
		 * @property {string} [fallback] Fallback text to display when the canvas is not supported.
		 * @property {string|undefined} [label] A string passed to the `aria-label` on the `<svg>` element.
		 * @property {string|undefined} [labelledBy] A string passed to the `aria-labelledby` on the `<svg>` element.
		 * @property {string|undefined} [describedBy] A string passed to `aria-describedby` property on the `<svg>` element.
		 * @property {import('svelte').Snippet<[{ element: HTMLCanvasElement | undefined, context: CanvasRenderingContext2D | null }]>} [children]
		 */
		/** @type {Props} */
		let {
			element = undefined,
			context = null,
			zIndex = undefined,
			pointerEvents = undefined,
			fallback = '',
			label = undefined,
			labelledBy = undefined,
			describedBy = undefined,
			children
		} = $$props;

		/**
		 * @type {{ ctx: import('svelte/store').Writable<CanvasRenderingContext2D|null> }}
		 */
		const cntxt = { ctx: writable(null) };

		setContext('canvas', cntxt);

		onMount(() => {
			if (element) {
				context = element.getContext('2d');

				if (context) {
					scaleCanvas(context, $.store_get($$store_subs ??= {}, '$width', width), $.store_get($$store_subs ??= {}, '$height', height));
					cntxt.ctx.set(context);
				}
			}
		});

		$$renderer.push(`<canvas class="layercake-layout-canvas"${$.attr_style('width:100%;height:100%;position:absolute;', {
			'z-index': zIndex,
			'pointer-events': pointerEvents === false ? 'none' : null,
			top: $.store_get($$store_subs ??= {}, '$padding', padding).top + 'px',
			right: $.store_get($$store_subs ??= {}, '$padding', padding).right + 'px',
			bottom: $.store_get($$store_subs ??= {}, '$padding', padding).bottom + 'px',
			left: $.store_get($$store_subs ??= {}, '$padding', padding).left + 'px'
		})}${$.attr('aria-label', label)}${$.attr('aria-labelledby', labelledBy)}${$.attr('aria-describedby', describedBy)}>`);

		if (fallback) {
			$$renderer.push(`<!--[0-->${$.escape(fallback)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></canvas> `);
		children?.($$renderer, { element, context });
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { element, context });
	});
}