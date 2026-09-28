import 'svelte/internal/disclose-version';
import { getAlphabet } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Highlight, Layer, Points, Rule, Tooltip } from 'layerchart';
import { sort } from '@layerstack/utils';

const alphabetData = await getAlphabet();
var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Lollipop($$anchor, $$props) {
	$.push($$props, true);

	const data = $.state($.proxy(sort(alphabetData, (d) => d.letter)));

	var $$exports = {
		get data() {
			return $.get(data);
		},

		set data($$value) {
			$.set(data, $.proxy($$value));
		}
	};

	Chart($$anchor, {
		get data() {
			return $.get(data);
		},
		x: 'letter',
		y: 'frequency',
		yNice: true,
		padding: { left: 20, bottom: 32 },
		tooltipContext: { mode: 'band' },
		height: 400,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, {
						placement: 'left',
						grid: true,
						rule: true,
						format: 'percentRound'
					});

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					Rule(node_3, { class: 'stroke-4 stroke-primary' });

					var node_4 = $.sibling(node_3, 2);

					Points(node_4, { class: 'fill-secondary' });

					var node_5 = $.sibling(node_4, 2);

					Highlight(node_5, { area: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root_1();
					var node_7 = $.first_child(fragment_3);

					$.component(node_7, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().letter;
							}
						});
					});

					var node_8 = $.sibling(node_7, 2);

					$.component(node_8, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_9 = $.first_child(fragment_4);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Frequency',
										get value() {
											return data().frequency;
										},
										format: 'percent'
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}