import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, ChartClipPath, Layer } from 'layerchart';
import { cubicInOut } from 'svelte/easing';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Clip_tween_on_mount($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(void 0);
	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	ShowControl(node, {
		label: 'Show Area',
		get show() {
			return $.get(show);
		},

		set show($$value) {
			$.set(show, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		yDomain: [0, null],
		yNice: true,
		padding: 20,
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, { placement: 'left', grid: true, rule: true });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'bottom', rule: true });

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => ({ width: { type: 'tween', duration: 1000, easing: cubicInOut } }));

								ChartClipPath($$anchor, {
									initialWidth: 0,
									get motion() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										Area($$anchor, {
											line: { class: 'stroke-2 stroke-primary' },
											class: 'fill-primary/30'
										});
									},
									$$slots: { default: true }
								});
							}
						};

						$.if(node_4, ($$render) => {
							if ($.get(show)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}