import * as $ from 'svelte/internal/server';
import { getContext, onMount, setContext } from 'svelte';
import { writable } from 'svelte/store';

export default function Webgl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * @typedef {Object} Props
		 * @property {HTMLCanvasElement|undefined} [element] The `<canvas>` element. A useful prop to bind to.
		 * @property {WebGLRenderingContext|null} [context] The WebGL rendering context for the canvas. A useful prop to bind to.
		 * @property {Object|undefined} [contextAttributes] Attributes to pass to the WebGL context.
		 * @property {number|undefined} [zIndex] Set the layout's z-index.
		 * @property {boolean|undefined} [pointerEvents] Set this to `false` to set `pointer-events: none;` on all of this layout's layers.
		 * @property {string} [fallback] Fallback text to display when the canvas is not supported.
		 * @property {string|undefined} [label] A string passed to the `aria-label` on the `<canvas>` element.
		 * @property {string|undefined} [labelledBy] A string passed to the `aria-labelledby` on the `<canvas>` element.
		 * @property {string|undefined} [describedBy] A string passed to the `aria-describedby` property on the `<canvas>` element.
		 * @property {import('svelte').Snippet<[{ element: HTMLCanvasElement | undefined, context: WebGLRenderingContext | null }]>} [children]
		 */
		/** @type {Props} */
		let {
			element = undefined,
			zIndex = undefined,
			pointerEvents = undefined,
			contextAttributes = undefined,
			context = null,
			fallback = '',
			label = undefined,
			labelledBy = undefined,
			describedBy = undefined,
			children
		} = $$props;

		let testGl;
		const { padding } = getContext('LayerCake');

		/**
		 * @type {{ gl: import('svelte/store').Writable<WebGLRenderingContext|null> }}
		 */
		const cntxt = { gl: writable(null) };

		setContext('gl', cntxt);

		onMount(() => {
			if (!element) return;

			/* --------------------------------------------
			 * Try to find a working webgl context
			 */
			const contexts = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];

			for (let j = 0; j < contexts.length; j++) {
				testGl = element.getContext(contexts[j], contextAttributes);

				if (testGl) {
					// @ts-ignore
					context = testGl;

					cntxt.gl.set(context);

					break;
				}
			}
		});

		$$renderer.push(`<canvas class="layercake-layout-webgl"${$.attr_style('width:100%;height:100%;position:absolute;', {
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