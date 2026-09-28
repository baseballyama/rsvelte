import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Facet from '../Facet.svelte';
import { getChartContext } from '$lib/contexts/chart.js';
import { setLayerContext } from '$lib/contexts/layer.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'zIndex',
	'pointerEvents',
	'role',
	'aria-label',
	'aria-labelledby',
	'aria-describedby',
	'center',
	'ignoreTransform',
	'clip',
	'class',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Html($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		zIndex = $.prop($$props, 'zIndex', 3, 0),
		pointerEvents = $.prop($$props, 'pointerEvents', 3, true),
		center = $.prop($$props, 'center', 3, false),
		ignoreTransform = $.prop($$props, 'ignoreTransform', 3, false),
		clip = $.prop($$props, 'clip', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const roleVal = $.derived(() => $$props.role || ($$props['aria-label'] || $$props['aria-labelledby'] || $$props['aria-describedby'] ? 'figure' : undefined));
	const ctx = getChartContext();

	const transform = $.derived(() => {
		if (ctx.transform.mode === 'canvas' && !ignoreTransform()) {
			return `translate(${ctx.transform.translate.x}px,${ctx.transform.translate.y}px) scale(${ctx.transform.scale})`;
		} else if (center()) {
			return `translate(${center() === 'x' || center() === true ? ctx.width / 2 : 0}px, ${center() === 'y' || center() === true ? ctx.height / 2 : 0}px)`;
		}
	});

	setLayerContext('html');

	var div = root();

	$.attribute_effect(
		div,
		() => ({
			class: ['lc-layout-html', $$props.class],
			role: $.get(roleVal),
			'aria-label': $$props['aria-label'],
			'aria-labelledby': $$props['aria-labelledby'],
			'aria-describedby': $$props['aria-describedby'],
			...restProps,
			[$.CLASS]: {
				disablePointerEvents: pointerEvents() === false,
				clip: clip()
			},
			[$.STYLE]: {
				transform: $.get(transform),
				'transform-origin': 'top left',
				'z-index': zIndex(),
				top: `${ctx.padding.top ?? ''}px`,
				bottom: `${ctx.padding.bottom ?? ''}px`,
				left: `${ctx.padding.left ?? ''}px`,
				right: `${ctx.padding.right ?? ''}px`
			}
		}),
		void 0,
		void 0,
		void 0,
		'svelte-19gkgt0'
	);

	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let facet = () => ($$arg0?.()).facet;
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ ref: $.get(ref), facet: facet() }));
			$.append($$anchor, fragment);
		};

		Facet(node, { children, $$slots: { default: true } });
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.append($$anchor, div);
	$.pop();
}