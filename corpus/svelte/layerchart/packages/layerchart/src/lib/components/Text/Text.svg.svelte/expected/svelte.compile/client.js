import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { createId } from '$lib/utils/createId.js';
import { TextState, textMarkInfo, getPixelValue } from './Text.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'svgRef',
	'ref',
	'pathId',
	'rotate',
	'dx',
	'dy',
	'fontSize'
]);

var root = $.from_svg(`<svg><text><tspan class="lc-text-tspan"> </tspan></text></svg>`);
var root_1 = $.from_svg(`<path></path>`);
var root_2 = $.from_svg(`<defs><!></defs><text><textPath class="lc-text-path"> </textPath></text>`, 1);
var root_3 = $.from_svg(`<tspan> </tspan>`);
var root_4 = $.from_svg(`<tspan class="lc-text-tspan"> </tspan>`);
var root_5 = $.from_svg(`<text><!></text>`);
var root_6 = $.from_svg(`<svg><!></svg>`);

export default function Text_svg($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let svgRefProp = $.prop($$props, 'svgRef', 15),
		refProp = $.prop($$props, 'ref', 15),
		pathId = $.prop($$props, 'pathId', 19, () => createId('text-path', uid)),
		// Pull out props that collide with SVG `<text>`/`<svg>` attribute names
		// — we use these internally for layout and transforms, not as raw DOM
		// attrs. Without this, `{...rest}` spread would set
		// `<text rotate="..." dx="..." dy="...">` (which SVG interprets per
		// glyph, not on the whole text).
		// `fontSize` is a typed prop (drives `capHeight` defaults), but on the
		// DOM it must be rendered as the kebab-case `font-size` attribute.
		rest = $.rest_props($$props, rest_excludes);

	const c = new TextState(() => ({
		rotate: $$props.rotate,
		dx: $$props.dx,
		dy: $$props.dy,
		fontSize: $$props.fontSize,
		...rest
	}));

	let ref = $.state(void 0);
	let svgRef = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	$.user_pre_effect(() => {
		svgRefProp($.get(svgRef));
	});

	c.chartCtx.registerComponent({
		name: 'Text',
		kind: 'mark',
		markInfo: () => textMarkInfo(rest, c.dataMode)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => c.resolvedItems, (item) => item.key, ($$anchor, item) => {
				const text = $.derived(() => c.resolveTextValue($.get(item).d));
				const resolvedFill = $.derived(() => resolveColorProp($$props.fill, $.get(item).d, c.chartCtx.cScale));
				const resolvedStroke = $.derived(() => resolveColorProp($$props.stroke, $.get(item).d, c.chartCtx.cScale));
				const resolvedFillOpacity = $.derived(() => resolveStyleProp($$props.fillOpacity, $.get(item).d));
				const resolvedStrokeWidth = $.derived(() => resolveStyleProp($$props.strokeWidth, $.get(item).d));
				const resolvedOpacity = $.derived(() => resolveStyleProp($$props.opacity, $.get(item).d));
				const resolvedClass = $.derived(() => resolveStyleProp($$props.class, $.get(item).d));

				const dataRotateTransform = $.derived(() => $$props.rotate
					? `rotate(${$$props.rotate}, ${$.get(item).x}, ${$.get(item).y})`
					: '');

				var svg = root();

				$.attribute_effect(svg, () => ({
					x: $$props.dx ?? 0,
					y: $$props.dy ?? 0,
					...$$props.svgProps,
					class: ['lc-text-svg', $$props.svgProps?.class]
				}));

				var text_1 = $.child(svg);

				$.attribute_effect(text_1, () => ({
					...rest,
					x: $.get(item).x,
					y: $.get(item).y,
					transform: $$props.transform ?? $.get(dataRotateTransform),
					'text-anchor': $$props.textAnchor ?? 'start',
					'dominant-baseline': $$props.dominantBaseline ?? 'auto',
					'font-size': $$props.fontSize,
					fill: $.get(resolvedFill),
					'fill-opacity': $.get(resolvedFillOpacity),
					stroke: $.get(resolvedStroke),
					'stroke-width': $.get(resolvedStrokeWidth),
					opacity: $.get(resolvedOpacity),
					class: ['lc-text', $.get(resolvedClass)]
				}));

				var tspan = $.child(text_1);
				var text_2 = $.only_child(tspan, true);

				$.reset(text_1);
				$.reset(svg);

				$.template_effect(() => {
					$.set_attribute(tspan, 'x', $.get(item).x);
					$.set_attribute(tspan, 'dy', c.dataModeStartDy);
					$.set_text(text_2, $.get(text));
				});

				$.append($$anchor, svg);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate_2 = ($$anchor) => {
			var svg_1 = root_6();

			$.attribute_effect(svg_1, () => ({
				x: $$props.dx ?? 0,
				y: $$props.dy ?? 0,
				...$$props.svgProps,
				class: ['lc-text-svg', $$props.svgProps?.class]
			}));

			var node_2 = $.child(svg_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = root_2();
					var defs = $.first_child(fragment_2);
					var node_3 = $.child(defs);

					$.key(node_3, () => $$props.path, ($$anchor) => {
						var path = root_1();

						$.bind_this(path, ($$value) => c.pathRef = $$value, () => c?.pathRef);

						$.template_effect(() => {
							$.set_attribute(path, 'id', pathId());
							$.set_attribute(path, 'd', $$props.path);
						});

						$.append($$anchor, path);
					});

					$.reset(defs);

					var text_3 = $.sibling(defs);

					$.attribute_effect(text_3, () => ({
						...rest,
						dy: $$props.dy ?? 0,
						'font-size': $$props.fontSize,
						fill: c.staticFill,
						'fill-opacity': c.staticFillOpacity,
						stroke: c.staticStroke,
						'stroke-width': c.staticStrokeWidth,
						opacity: c.staticOpacity,
						transform: $$props.transform,
						class: ['lc-text', c.staticClassName]
					}));

					var textPath = $.child(text_3);
					var text_4 = $.only_child(textPath, true);

					$.reset(text_3);
					$.bind_this(text_3, ($$value) => $.set(ref, $$value), () => $.get(ref));

					$.template_effect(
						($0) => {
							$.set_style(textPath, `text-anchor: ${$$props.textAnchor ?? 'start' ?? ''};`);
							$.set_attribute(textPath, 'dominant-baseline', $$props.dominantBaseline ?? 'auto');
							$.set_attribute(textPath, 'href', `#${pathId() ?? ''}`);
							$.set_attribute(textPath, 'startOffset', $$props.startOffset ?? '0%');
							$.set_text(text_4, $0);
						},
						[
							() => c.wordsByLines.map((line) => line.words.join(' ')).join()
						]
					);

					$.append($$anchor, fragment_2);
				};

				var alternate_1 = ($$anchor) => {
					var text_5 = root_5();

					$.attribute_effect(text_5, () => ({
						...rest,
						x: c.motionX,
						y: c.motionY,
						transform: c.transform,
						'text-anchor': $$props.textAnchor ?? 'start',
						'dominant-baseline': $$props.dominantBaseline ?? 'auto',
						'font-size': $$props.fontSize,
						fill: c.staticFill,
						'fill-opacity': c.staticFillOpacity,
						stroke: c.staticStroke,
						'stroke-width': c.staticStrokeWidth,
						opacity: c.staticOpacity,
						class: ['lc-text', c.staticClassName]
					}));

					var node_4 = $.child(text_5);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.each(node_5, 17, () => $$props.segments, $.index, ($$anchor, segment, index) => {
								var tspan_1 = root_3();
								var text_6 = $.only_child(tspan_1, true);

								$.template_effect(() => {
									$.set_attribute(tspan_1, 'dy', index === 0 ? c.startDy : 0);
									$.set_class(tspan_1, 0, $.clsx(['lc-text-tspan', $.get(segment).class]));
									$.set_text(text_6, $.get(segment).value);
								});

								$.append($$anchor, tspan_1);
							});

							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.each(node_6, 17, () => c.wordsByLines, $.index, ($$anchor, line, index) => {
								var tspan_2 = root_4();
								var text_7 = $.only_child(tspan_2, true);

								$.template_effect(
									($0, $1) => {
										$.set_attribute(tspan_2, 'x', c.motionX);
										$.set_attribute(tspan_2, 'dy', $0);
										$.set_text(text_7, $1);
									},
									[
										() => index === 0
											? c.startDy
											: getPixelValue($$props.lineHeight ?? '1em'),
										() => $.get(line).words.join(' ')
									]
								);

								$.append($$anchor, tspan_2);
							});

							$.append($$anchor, fragment_4);
						};

						$.if(node_4, ($$render) => {
							if ($$props.segments) $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.reset(text_5);
					$.bind_this(text_5, ($$value) => $.set(ref, $$value), () => $.get(ref));
					$.append($$anchor, text_5);
				};

				$.if(node_2, ($$render) => {
					if ($$props.path) $$render(consequent_1); else $$render(alternate_1, -1);
				});
			}

			$.reset(svg_1);
			$.bind_this(svg_1, ($$value) => $.set(svgRef, $$value), () => $.get(svgRef));
			$.append($$anchor, svg_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate_2, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}