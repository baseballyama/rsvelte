import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { Context } from 'runed';

const _WebGLContext = new Context('WebGL');

export function setWebGLContext(context) {
	return _WebGLContext.set(context);
}

export function getWebGLContext() {
	const defaultContext = $.proxy({ gl: null });

	return _WebGLContext.getOr(defaultContext);
}

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'context',
	'ref',
	'contextAttributes',
	'fallback',
	'pointerEvents',
	'zIndex',
	'class',
	'children'
]);

var root = $.from_html(`<canvas><!></canvas> <!>`, 1);

export default function WebGL($$anchor, $$props) {
	$.push($$props, true);

	let context = $.prop($$props, 'context', 15),
		refProp = $.prop($$props, 'ref', 15),
		fallback = $.prop($$props, 'fallback', 3, ''),
		pointerEvents = $.prop($$props, 'pointerEvents', 3, true),
		zIndex = $.prop($$props, 'zIndex', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	let testGl;
	const ctx = getChartContext();

	onMount(() => {
		/* --------------------------------------------
		 * Try to find a working webgl context
		 */
		const contexts = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];

		for (let j = 0; j < contexts.length; j++) {
			testGl = $.get(ref)?.getContext(contexts[j], $$props.contextAttributes);

			if (testGl) {
				// @ts-ignore
				context(testGl);

				break;
			}
		}
	});

	setWebGLContext({
		get gl() {
			return context() ?? null;
		},

		set gl(v) {
			if (v) {
				context(v);
			}

			context(undefined);
		}
	});

	var fragment = root();
	var canvas = $.first_child(fragment);

	$.attribute_effect(
		canvas,
		() => ({
			class: ['lc-layout-webgl', $$props.class],
			...restProps,
			[$.CLASS]: { disablePointerEvents: pointerEvents() === false },
			[$.STYLE]: {
				'z-index': zIndex(),
				top: ctx.padding.top + 'px',
				right: ctx.padding.right + 'px',
				bottom: ctx.padding.bottom + 'px',
				left: ctx.padding.left + 'px'
			}
		}),
		void 0,
		void 0,
		void 0,
		'svelte-jilr8m'
	);

	var node = $.child(canvas);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, fallback);
			$.append($$anchor, fragment_1);
		};

		var consequent_1 = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, fallback()));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (typeof fallback() === 'function') $$render(consequent); else if (fallback()) $$render(consequent_1, 1);
		});
	}

	$.reset(canvas);
	$.bind_this(canvas, ($$value) => $.set(ref, $$value), () => $.get(ref));

	var node_2 = $.sibling(canvas, 2);

	$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ ref: $.get(ref), webGLContext: context() }));
	$.append($$anchor, fragment);
	$.pop();
}