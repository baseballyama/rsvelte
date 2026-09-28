import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';

import {
	Axis,
	Chart,
	Circle,
	FacetAxis,
	Grid,
	Highlight,
	Svg,
	Tooltip
} from 'layerchart';

const penguins = await getPenguins();
var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Facet_tooltip($$anchor, $$props) {
	$.push($$props, true);

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'flipper_length_mm',
		y: 'body_mass_g',
		fx: 'species',
		cRange: [
			'var(--color-info)',
			'var(--color-success)',
			'var(--color-warning)'
		],
		xNice: true,
		yNice: true,
		tooltipContext: { mode: 'quadtree' },
		padding: { left: 52, bottom: 32, top: 24, right: 8 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Svg(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					FacetAxis(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					Grid(node_2, { x: true, y: true });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'left' });

					var node_4 = $.sibling(node_3, 2);

					Axis(node_4, { placement: 'bottom' });

					var node_5 = $.sibling(node_4, 2);

					Circle(node_5, {
						cx: 'flipper_length_mm',
						cy: 'body_mass_g',
						r: 2.5,
						fill: 'island',
						fillOpacity: 0.6
					});

					var node_6 = $.sibling(node_5, 2);

					Highlight(node_6, { lines: true, points: true, axis: 'both' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root_1();
					var node_8 = $.first_child(fragment_3);

					$.component(node_8, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, `${data().species ?? ''} · ${data().island ?? ''}`));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_9 = $.sibling(node_8, 2);

					$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_1();
								var node_10 = $.first_child(fragment_5);

								$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'flipper',
										get value() {
											return data().flipper_length_mm;
										}
									});
								});

								var node_11 = $.sibling(node_10, 2);

								$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'mass',
										get value() {
											return data().body_mass_g;
										}
									});
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}