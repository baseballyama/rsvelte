import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, ChartClipPath, Layer, LinearGradient } from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid grid-cols-[40px_1fr]"><div><!></div> <!></div>`);

export default function Separate_chart__clip_data_y_axis_($$anchor, $$props) {
	$.push($$props, true);

	let yDomain = $.state($.proxy([null, null]));
	var $$exports = { data };
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Chart(node, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		padding: { bottom: 24 },
		brush: {
			axis: 'y',
			onChange: (e) => {
				$.set(yDomain, e.brush.y, true);
			}
		},
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Area($$anchor, {
						line: { class: 'stroke-2 stroke-primary' },
						class: 'fill-primary/20'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	Chart(node_1, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		get yDomain() {
			return $.get(yDomain);
		},
		padding: { left: 32, bottom: 24 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_2 = $.first_child(fragment_3);

					Axis(node_2, { placement: 'left', grid: true, rule: true });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'bottom', rule: true });

					var node_4 = $.sibling(node_3, 2);

					ChartClipPath(node_4, {
						children: ($$anchor, $$slotProps) => {
							{
								const children = ($$anchor, $$arg0) => {
									let gradient = () => ($$arg0?.()).gradient;

									Area($$anchor, {
										line: { class: 'stroke-2 stroke-primary' },
										get fill() {
											return gradient();
										}
									});
								};

								LinearGradient($$anchor, {
									class: 'from-primary/50 to-primary/1',
									vertical: true,
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}