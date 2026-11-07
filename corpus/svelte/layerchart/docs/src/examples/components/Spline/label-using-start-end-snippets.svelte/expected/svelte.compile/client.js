import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, Spline, Circle, Text } from 'layerchart';
import SplineControls from '$lib/components/controls/SplineControls2.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Label_using_start_end_snippets($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		show: true,
		pointCount: 100,
		amplitude: 1,
		frequency: 10,
		phase: 0,
		curve: undefined,
		pathGenerator: (x) => x
	}));

	const data = $.derived(() => Array.from({ length: $.get(config).pointCount }).map((_, i) => {
		return {
			x: i + 1,
			y: $.get(config).pathGenerator(i / $.get(config).pointCount) ?? i
		};
	}));

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var fragment = root();
	var node = $.first_child(fragment);

	SplineControls(node, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
		get data() {
			return $.get(data);
		},
		x: 'x',
		y: 'y',
		yNice: true,
		padding: 25,
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, { placement: 'left', grid: true, rule: true });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'bottom', rule: true });

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent = ($$anchor) => {
							{
								const startContent = ($$anchor) => {
									var fragment_4 = root();
									var node_5 = $.first_child(fragment_4);

									Circle(node_5, { r: 5, class: 'fill-primary' });

									var node_6 = $.sibling(node_5, 2);

									Text(node_6, {
										value: 'start',
										textAnchor: 'start',
										verticalAnchor: 'middle',
										dx: 8
									});

									$.append($$anchor, fragment_4);
								};

								const endContent = ($$anchor) => {
									var fragment_5 = root();
									var node_7 = $.first_child(fragment_5);

									Circle(node_7, { r: 5, class: 'fill-primary' });

									var node_8 = $.sibling(node_7, 2);

									Text(node_8, { value: 'end', verticalAnchor: 'middle', dx: 8 });
									$.append($$anchor, fragment_5);
								};

								Spline($$anchor, {
									get curve() {
										return $.get(config).curve;
									},
									class: 'stroke-primary stroke-2',
									startContent,
									endContent,
									$$slots: { startContent: true, endContent: true }
								});
							}
						};

						$.if(node_4, ($$render) => {
							if ($.get(config).show) $$render(consequent);
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