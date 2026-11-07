import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Spline, Layer } from 'layerchart';
import MarkerControls from '$lib/components/controls/MarkerControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Styling($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		show: true,
		tweened: true,
		pathGenerator: (x) => x,
		curve: undefined,
		pointCount: 10,
		amplitude: 1,
		frequency: 10,
		phase: 0
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

	MarkerControls(node, {
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
		height: 200,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(config).tweened ? 'tween' : 'none');

								Spline($$anchor, {
									get curve() {
										return $.get(config).curve;
									},
									class: 'stroke-primary stroke-2',
									markerStart: { type: 'circle', size: 20, class: 'stroke-2 fill-secondary' },
									markerMid: { type: 'line', class: 'stroke-2 stroke-accent' },
									markerEnd: {
										type: 'triangle',
										size: 20,
										class: 'stroke-2 stroke-surface-100 fill-secondary'
									},

									get motion() {
										return $.get($0);
									}
								});
							}
						};

						$.if(node_2, ($$render) => {
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