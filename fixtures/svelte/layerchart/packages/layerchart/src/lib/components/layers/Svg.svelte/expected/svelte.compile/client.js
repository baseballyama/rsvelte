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
	'innerRef',
	'zIndex',
	'pointerEvents',
	'viewBox',
	'ignoreTransform',
	'center',
	'clip',
	'class',
	'title',
	'defs',
	'children'
]);

var root = $.from_svg(`<title class="lc-layout-svg-title"> </title>`);
var root_1 = $.from_svg(`<g class="lc-layout-svg-g-transform"><!></g>`);
var root_2 = $.from_svg(`<svg><!><defs><!></defs><g class="lc-layout-svg-g"><!></g></svg>`);

export default function Svg($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		innerRefProp = $.prop($$props, 'innerRef', 15),
		zIndex = $.prop($$props, 'zIndex', 3, 0),
		ignoreTransform = $.prop($$props, 'ignoreTransform', 3, false),
		center = $.prop($$props, 'center', 3, false),
		clip = $.prop($$props, 'clip', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);
	let innerRef = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	$.user_pre_effect(() => {
		innerRefProp($.get(innerRef));
	});

	const ctx = getChartContext();

	const transform = $.derived(() => {
		if (ctx.transform.mode === 'canvas' && !ignoreTransform()) {
			return `translate(${ctx.transform.translate.x},${ctx.transform.translate.y}) scale(${ctx.transform.scale})`;
		} else if (center()) {
			return `translate(${center() === 'x' || center() === true ? ctx.width / 2 : 0}, ${center() === 'y' || center() === true ? ctx.height / 2 : 0})`;
		}
	});

	setLayerContext('svg');

	var svg = root_2();

	$.attribute_effect(
		svg,
		() => ({
			viewBox: $$props.viewBox,
			width: ctx.containerWidth,
			height: ctx.containerHeight,
			class: ['lc-layout-svg', $$props.class],
			role: 'figure',
			...restProps,
			[$.CLASS]: {
				disablePointerEvents: $$props.pointerEvents === false,
				clip: clip()
			},
			[$.STYLE]: { 'z-index': zIndex() }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-1phxlxb'
	);

	var node = $.child(svg);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.title);
			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var title_1 = root();
			var text = $.only_child(title_1, true);

			$.template_effect(() => $.set_text(text, $$props.title));
			$.append($$anchor, title_1);
		};

		$.if(node, ($$render) => {
			if (typeof $$props.title === 'function') $$render(consequent); else if ($$props.title) $$render(consequent_1, 1);
		});
	}

	var defs_1 = $.sibling(node);
	var node_2 = $.child(defs_1);

	$.snippet(node_2, () => $$props.defs ?? $.noop);
	$.reset(defs_1);

	var g = $.sibling(defs_1);
	var node_3 = $.child(g);

	{
		var consequent_2 = ($$anchor) => {
			var g_1 = root_1();
			var node_4 = $.child(g_1);

			{
				const children = ($$anchor, $$arg0) => {
					let facet = () => ($$arg0?.()).facet;
					var fragment_1 = $.comment();
					var node_5 = $.first_child(fragment_1);

					$.snippet(node_5, () => $$props.children ?? $.noop, () => ({ ref: $.get(ref), facet: facet() }));
					$.append($$anchor, fragment_1);
				};

				Facet(node_4, { children, $$slots: { default: true } });
			}

			$.reset(g_1);
			$.template_effect(() => $.set_attribute(g_1, 'transform', $.get(transform)));
			$.append($$anchor, g_1);
		};

		var alternate = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let facet = () => ($$arg0?.()).facet;
					var fragment_3 = $.comment();
					var node_6 = $.first_child(fragment_3);

					$.snippet(node_6, () => $$props.children ?? $.noop, () => ({ ref: $.get(ref), facet: facet() }));
					$.append($$anchor, fragment_3);
				};

				Facet($$anchor, { children, $$slots: { default: true } });
			}
		};

		$.if(node_3, ($$render) => {
			if ($.get(transform)) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(g);
	$.bind_this(g, ($$value) => $.set(innerRef, $$value), () => $.get(innerRef));
	$.reset(svg);
	$.bind_this(svg, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.template_effect(() => $.set_attribute(g, 'transform', `translate(${ctx.padding.left ?? ''}, ${ctx.padding.top ?? ''})`));
	$.append($$anchor, svg);
	$.pop();
}