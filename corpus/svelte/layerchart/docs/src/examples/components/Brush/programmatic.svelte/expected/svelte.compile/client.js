import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Brush, Chart, Layer, defaultChartPadding } from 'layerchart';
import { Button, ButtonGroup } from 'svelte-ux';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Programmatic($$anchor, $$props) {
	$.push($$props, true);

	let brush = $.state(void 0);
	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	ButtonGroup(node, {
		variant: 'fill-light',
		size: 'sm',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				onclick: () => {
					const mid = Math.floor(data.length / 3);

					$.get(brush)?.move({ x: [data[0].date, data[mid].date] });
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('First Third');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				onclick: () => {
					const start = Math.floor(data.length / 3 * 2);

					$.get(brush)?.move({ x: [data[start].date, data[data.length - 1].date] });
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Last Third');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				onclick: () => $.get(brush)?.selectAll(),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Select All');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				onclick: () => $.get(brush)?.reset(),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Reset');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		Chart(node_5, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			get padding() {
				return $.get($0);
			},
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_6 = $.first_child(fragment_3);

						Axis(node_6, { placement: 'left', grid: true, rule: true });

						var node_7 = $.sibling(node_6, 2);

						Axis(node_7, { placement: 'bottom', rule: true });

						var node_8 = $.sibling(node_7, 2);

						Area(node_8, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/20'
						});

						var node_9 = $.sibling(node_8, 2);

						Brush(node_9, {
							get state() {
								return $.get(brush);
							},

							set state($$value) {
								$.set(brush, $$value, true);
							}
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}