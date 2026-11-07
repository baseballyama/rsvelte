import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, Spline, Points } from 'layerchart';
import SplineControls from '$lib/components/controls/SplineControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		show: false,
		showPoints: false,
		pointCount: 100,
		pathGenerator: (x) => x,
		curve: undefined,
		amplitude: 1,
		frequency: 10,
		phase: 0,
		motion: 'tween'
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

	var fragment = root_1();
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
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, { placement: 'left', grid: true, rule: true });

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'bottom', rule: true });

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(config).motion === 'tween' ? 'tween' : 'none');
								let $1 = $.derived(() => $.get(config).motion === 'draw');

								Spline($$anchor, {
									get curve() {
										return $.get(config).curve;
									},

									get motion() {
										return $.get($0);
									},

									get draw() {
										return $.get($1);
									},
									class: 'stroke-primary stroke-2'
								});
							}
						};

						$.if(node_4, ($$render) => {
							if ($.get(config).show) $$render(consequent);
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(config).motion === 'tween' ? 'tween' : 'none');

								Points($$anchor, {
									get motion() {
										return $.get($0);
									},
									r: 3,
									class: 'fill-surface-100 stroke-primary'
								});
							}
						};

						$.if(node_5, ($$render) => {
							if ($.get(config).showPoints) $$render(consequent_1);
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