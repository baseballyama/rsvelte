import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, MotionPath, Polygon, Spline } from 'layerchart';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import MotionPathControls from '$lib/components/controls/MotionPathControls.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Rotate_object_with_path($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		pointCount: 100,
		pathGenerator: (x) => x,
		curve: undefined,
		amplitude: 1,
		frequency: 10,
		phase: 0,
		show: false,
		duration: '5s',
		repeatCount: 'indefinite',
		start: undefined,
		rotate: 'auto'
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

	MotionPathControls(node, {
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
		padding: { left: 16, bottom: 24 },
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
								const children = ($$anchor, $$arg0) => {
									let pathId = () => ($$arg0?.()).pathId;
									let objectId = () => ($$arg0?.()).objectId;
									var fragment_4 = root();
									var node_5 = $.first_child(fragment_4);

									Spline(node_5, {
										get id() {
											return pathId();
										},

										get curve() {
											return $.get(config).curve;
										}
									});

									var node_6 = $.sibling(node_5, 2);

									Polygon(node_6, {
										get id() {
											return objectId();
										},
										r: 10,
										points: 3,
										class: 'stroke-surface-content fill-surface-100'
									});

									$.append($$anchor, fragment_4);
								};

								MotionPath($$anchor, $.spread_props(
									{
										get duration() {
											return $.get(config).duration;
										},

										get repeatCount() {
											return $.get(config).repeatCount;
										},

										get rotate() {
											return $.get(config).rotate;
										}
									},
									() => $.get(config).start ? { begin: $.get(config).start } : {},
									{ children, $$slots: { default: true } }
								));
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