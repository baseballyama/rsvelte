import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, onMount, setContext } from 'svelte';
import { writable } from 'svelte/store';
import scaleCanvas from '../lib/scaleCanvas.js';

var root = $.from_html(`<canvas class="layercake-layout-canvas"><!></canvas> <!>`, 1);

export default function Canvas($$anchor, $$props) {
	$.push($$props, true);

	const $width = () => $.store_get(width, '$width', $$stores);
	const $height = () => $.store_get(height, '$height', $$stores);
	const $padding = () => $.store_get(padding, '$padding', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	let element = $.prop($$props, 'element', 15, undefined),
		context = $.prop($$props, 'context', 15, null),
		zIndex = $.prop($$props, 'zIndex', 3, undefined),
		pointerEvents = $.prop($$props, 'pointerEvents', 3, undefined),
		fallback = $.prop($$props, 'fallback', 3, ''),
		label = $.prop($$props, 'label', 3, undefined),
		labelledBy = $.prop($$props, 'labelledBy', 3, undefined),
		describedBy = $.prop($$props, 'describedBy', 3, undefined);

	/**
	 * @type {{ ctx: import('svelte/store').Writable<CanvasRenderingContext2D|null> }}
	 */
	const cntxt = { ctx: writable(null) };

	setContext('canvas', cntxt);

	onMount(() => {
		if (element()) {
			context(element().getContext('2d'));

			if (context()) {
				scaleCanvas(context(), $width(), $height());
				cntxt.ctx.set(context());
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