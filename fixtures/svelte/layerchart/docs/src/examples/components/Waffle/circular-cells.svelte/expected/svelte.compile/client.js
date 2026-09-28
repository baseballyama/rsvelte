import 'svelte/internal/disclose-version';
import { getAlphabet } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Tooltip, Waffle } from 'layerchart';

const data = await getAlphabet();
var root = $.from_html(`<!> <!>`, 1);

export default function Circular_cells($$anchor, $$props) {
	$.push($$props, true);

	const scaled = data.slice(0, 18).map((d) => ({ letter: d.letter, count: Math.round(d.frequency * 500) }));
	var $$exports = { data };

	{
		const marks = ($$anchor) => {
			Waffle($$anchor, {
				fill: 'var(--color-secondary)',
				rx: '100%',
				ry: '100%',
				gap: 2,
				tooltip: true
			});
		};

		const tooltip = ($$anchor) => {
			var fragment_2 = $.comment();
			var node = $.first_child(fragment_2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root();
					var node_1 = $.first_child(fragment_3);

					$.component(node_1, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().letter));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_3 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => data().count / 500);

									$.component(node_3, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Frequency',
											get value() {
												return $.get($0);
											},
											format: 'percent'
										});
									});
								}

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_2);
		};

		Chart($$anchor, {
			get data() {
				return scaled;
			},
			x: 'letter',
			bandPadding: 0.2,
			y: 'count',
			yDomain: [0, null],
			yNice: true,
			padding: { left: 32, bottom: 24, top: 8, right: 8 },
			height: 400,
			rule: true,
			grid: true,
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}