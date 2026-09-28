import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { Context } from 'runed';

const _WebGLContext = new Context('WebGL');

export function setWebGLContext(context) {
	return _WebGLContext.set(context);
}

export function getWebGLContext() {
	const defaultContext = { gl: null };

	return _WebGLContext.getOr(defaultContext);
}

export default function WebGL($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			context = void 0,
			ref: refProp = void 0,
			contextAttributes,
			fallback = '',
			pointerEvents = true,
			zIndex = 0,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;
		let testGl;
		const ctx = getChartContext();

		onMount(() => {
			/* --------------------------------------------
			 * Try to find a working webgl context
			 */
			const contexts = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];

			for (let j = 0; j < contexts.length; j++) {
				testGl = ref?.getContext(contexts[j], contextAttributes);

				if (testGl) {
					// @ts-ignore
					context = testGl;

					break;
				}
			}
		});

		setWebGLContext({
			get gl() {
				return context ?? null;
			},

			set gl(v) {
				if (v) {
					context = v;
				}

				context = undefined;
			}
		});

		$$renderer.push(`<canvas${$.attributes({ class: $.clsx(['lc-layout-webgl', className]), ...restProps }, 'svelte-jilr8m', { disablePointerEvents: pointerEvents === false }, {
			'z-index': zIndex,
			top: ctx.padding.top + 'px',
			right: ctx.padding.right + 'px',
			bottom: ctx.padding.bottom + 'px',
			left: ctx.padding.left + 'px'
		})}>`);

		if (typeof fallback === 'function') {
			$$renderer.push('<!--[0-->');
			fallback($$renderer);
			$$renderer.push(`<!---->`);
		} else if (fallback) {
			$$renderer.push(`<!--[1-->${$.escape(fallback)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></canvas> `);
		children?.($$renderer, { ref, webGLContext: context });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { context, ref: refProp });
	});
}