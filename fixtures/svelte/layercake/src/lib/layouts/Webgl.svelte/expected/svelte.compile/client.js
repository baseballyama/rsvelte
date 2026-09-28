import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, onMount, setContext } from 'svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<canvas class="layercake-layout-webgl"><!></canvas> <!>`, 1);

export default function Webgl($$anchor, $$props) {
	$.push($$props, true);

	const $padding = () => $.store_get(padding, '$padding', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
	let element = $.prop($$props, 'element', 15, undefined),
		zIndex = $.prop($$props, 'zIndex', 3, undefined),
		pointerEvents = $.prop($$props, 'pointerEvents', 3, undefined),
		contextAttributes = $.prop($$props, 'contextAttributes', 3, undefined),
		context = $.prop($$props, 'context', 15, null),
		fallback = $.prop($$props, 'fallback', 3, ''),
		label = $.prop($$props, 'label', 3, undefined),
		labelledBy = $.prop($$props, 'labelledBy', 3, undefined),
		describedBy = $.prop($$props, 'describedBy', 3, undefined);

	let testGl;
	const { padding } = getContext('LayerCake');

	/**
	 * @type {{ gl: import('svelte/store').Writable<WebGLRenderingContext|null> }}
	 */
	const cntxt = { gl: writable(null) };

	setContext('gl', cntxt);

	onMount(() => {
		if (!element()) return;

		/* --------------------------------------------
		 * Try to find a working webgl context
		 */
		const contexts = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];

		for (let j = 0; j < contexts.length; j++) {
			testGl = element().getContext(contexts[j], contextAttributes());

			if (testGl) {
				// @ts-ignore
				context(testGl);

				cntxt.gl.set(context());

				break;
			}
		}
	});

	var fragment = root();
	var canvas = $.first_child(fragment);
	let styles;
	var node = $.child(canvas);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, fallback()));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (fallback()) $$render(consequent);
		});
	}

	$.reset(canvas);
	$.bind_this(canvas, ($$value) => element($$value), () => element());

	var node_1 = $.sibling(canvas, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ element: element(), context: context() }));

	$.template_effect(() => {
		styles = $.set_style(canvas, 'width:100%;height:100%;position:absolute;', styles, {
			'z-index': zIndex(),
			'pointer-events': pointerEvents() === false ? 'none' : null,
			top: $padding().top + 'px',
			right: $padding().right + 'px',
			bottom: $padding().bottom + 'px',
			left: $padding().left + 'px'
		});

		$.set_attribute(canvas, 'aria-label', label());
		$.set_attribute(canvas, 'aria-labelledby', labelledBy());
		$.set_attribute(canvas, 'aria-describedby', describedBy());
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}