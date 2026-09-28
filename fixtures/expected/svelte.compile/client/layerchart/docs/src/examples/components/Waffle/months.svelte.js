import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { interpolateRainbow } from 'd3-scale-chromatic';

var root = $.from_html(`<!> <!>`, 1);

export default function Months($$anchor, $$props) {
	$.push($$props, true);

	const months = [
		{ month: 'Jan', days: 31 },
		{ month: 'Feb', days: 28 },
		{ month: 'Mar', days: 31 },
		{ month: 'Apr', days: 30 },
		{ month: 'May', days: 31 },
		{ month: 'Jun', days: 30 },
		{ month: 'Jul', days: 31 },
		{ month: 'Aug', days: 31 },
		{ month: 'Sep', days: 30 },
		{ month: 'Oct', days: 31 },
		{ month: 'Nov', days: 30 },
		{ month: 'Dec', days: 31 }
	];

	// Stack months end-to-end as cumulative day ranges so each datum is a
	// segment along the x axis colored by month.
	const data = [];

	let acc = 0;

	for (const m of months) {
		data.push({ month: m.month, values: [acc, acc + m.days] });
		acc += m.days;
	}

	// Sample the cyclical rainbow interpolator at 12 evenly-spaced points so
	// adjacent months get adjacent hues and Dec wraps back toward Jan.
	const colors = months.map((_, i) => interpolateRainbow(i / months.length));

	var $$exports = { data };

	{
		const marks = ($$anchor) => {
			Waffle($$anchor, { axis: 'x', unit: 1, tooltip: true });
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

								$.template_effect(() => $.set_text(text, data().month));
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
									let $0 = $.derived(() => data().values[1] - data().values[0]);

									$.component(node_3, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Days',
											get value() {
												return $.get($0);
											},
											format: 'integer'
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
				return data;
			},
			x: 'values',
			xDomain: [0, 365],
			y: (d) => '',
			c: 'month',
			get cRange() {
				return colors;
			},
			padding: { left: 8, bottom: 32, top: 8, right: 8 },
			height: 140,
			axis: { placement: 'bottom', label: 'days →', labelPlacement: 'end' },
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}