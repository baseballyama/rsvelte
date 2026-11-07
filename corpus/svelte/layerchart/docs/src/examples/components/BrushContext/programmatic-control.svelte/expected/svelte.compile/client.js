import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { Button, ButtonGroup } from 'svelte-ux';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Programmatic_control($$anchor, $$props) {
	$.push($$props, true);

	let context = $.state(void 0);
	var $$exports = { data };
	var fragment = root();
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

					$.get(context)?.brush.move({ x: [data[0].date, data[mid].date] });
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
					const start = Math.floor(data.length / 3);
					const end = Math.floor(data.length / 3 * 2);

					$.get(context)?.brush.move({ x: [data[start].date, data[end].date] });
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Middle Third');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				onclick: () => {
					const start = Math.floor(data.length / 3 * 2);

					$.get(context)?.brush.move({ x: [data[start].date, data[data.length - 1].date] });
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Last Third');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	ButtonGroup(node_4, {
		variant: 'fill-light',
		size: 'sm',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_5 = $.first_child(fragment_2);

			Button(node_5, {
				onclick: () => $.get(context)?.brush.selectAll(),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Select All');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				onclick: () => $.get(context)?.brush.reset(),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Reset');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

		Chart(node_7, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			get padding() {
				return $.get($0);
			},
			brush: true,
			height: 300,
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_8 = $.first_child(fragment_4);

						Axis(node_8, { placement: 'left', grid: true, rule: true });

						var node_9 = $.sibling(node_8, 2);

						Axis(node_9, { placement: 'bottom', rule: true });

						var node_10 = $.sibling(node_9, 2);

						Area(node_10, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/20'
						});

						$.append($$anchor, fragment_4);
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