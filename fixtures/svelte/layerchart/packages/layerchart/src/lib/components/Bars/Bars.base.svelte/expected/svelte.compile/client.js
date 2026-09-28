import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { BarsState } from './Bars.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Bar',
	'Group',
	'fill',
	'key',
	'data',
	'onBarClick',
	'children',
	'radius',
	'strokeWidth',
	'stroke',
	'seriesKey',
	'stackPadding'
]);

export default function Bars_base($$anchor, $$props) {
	$.push($$props, true);

	let key = $.prop($$props, 'key', 3, (_, i) => i),
		onBarClick = $.prop($$props, 'onBarClick', 3, () => {}),
		radius = $.prop($$props, 'radius', 3, 0),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 0),
		stroke = $.prop($$props, 'stroke', 3, 'black'),
		stackPadding = $.prop($$props, 'stackPadding', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	const c = new BarsState(() => ({
		data: $$props.data,
		key: key(),
		onBarClick: onBarClick(),
		seriesKey: $$props.seriesKey,
		stackPadding: stackPadding(),
		fill: $$props.fill,
		radius: radius(),
		strokeWidth: strokeWidth(),
		stroke: stroke()
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $$props.Group, ($$anchor, Group_1) => {
		Group_1($$anchor, {
			class: 'lc-bars',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.snippet(node_2, () => $$props.children);
						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.each(node_3, 19, () => c.data, (d, i) => key()(d, i), ($$anchor, d) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => $$props.fill ?? c.series?.color ?? (c.ctx.config.c ? c.ctx.cGet($.get(d)) : null));
								let $1 = $.derived(() => extractLayerProps(restProps, 'lc-bars-bar'));

								$.component(node_4, () => $$props.Bar, ($$anchor, Bar_1) => {
									Bar_1($$anchor, $.spread_props(
										{
											get data() {
												return $.get(d);
											},

											get radius() {
												return radius();
											},

											get strokeWidth() {
												return strokeWidth();
											},

											get stroke() {
												return stroke();
											},

											get seriesKey() {
												return $$props.seriesKey;
											},

											get stackPadding() {
												return stackPadding();
											},

											get fill() {
												return $.get($0);
											},
											onclick: (e) => onBarClick()(e, { data: $.get(d) })
										},
										() => $.get($1)
									));
								});
							}

							$.append($$anchor, fragment_4);
						});

						$.append($$anchor, fragment_3);
					};

					$.if(node_1, ($$render) => {
						if ($$props.children) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}