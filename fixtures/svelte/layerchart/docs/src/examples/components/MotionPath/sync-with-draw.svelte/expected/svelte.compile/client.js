import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { linear } from 'svelte/easing';
import { Axis, Chart, Circle, Layer, MotionPath, Spline } from 'layerchart';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import MotionPathControls from '$lib/components/controls/MotionPathControls.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Sync_with_draw($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		pointCount: 100,
		pathGenerator: (x) => x,
		curve: undefined,
		amplitude: 1,
		frequency: 10,
		phase: 0,
		show: false,
		duration: '3s',
		repeatCount: undefined,
		start: undefined,
		rotate: undefined
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
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.key(node_5, () => $.get(data), ($$anchor) => {
								{
									const children = ($$anchor, $$arg0) => {
										let pathId = () => ($$arg0?.()).pathId;
										let objectId = () => ($$arg0?.()).objectId;
										var fragment_5 = root();
										var node_6 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => ({ duration: 3000, easing: linear }));

											Spline(node_6, {
												get id() {
													return pathId();
												},

												get curve() {
													return $.get(config).curve;
												},

												get draw() {
													return $.get($0);
												}
											});
										}

										var node_7 = $.sibling(node_6, 2);

										Circle(node_7, {
											get id() {
												return objectId();
											},
											r: 5,
											class: 'fill-surface-100 stroke-surface-content'
										});

										$.append($$anchor, fragment_5);
									};

									MotionPath($$anchor, $.spread_props(
										{
											get duration() {
												return $.get(config).duration;
											}
										},
										() => $.get(config).repeatCount ? { repeatCount: $.get(config).repeatCount } : {},
										() => $.get(config).start ? { begin: $.get(config).start } : {},
										() => $.get(config).rotate ? { rotate: $.get(config).rotate } : {},
										{ children, $$slots: { default: true } }
									));
								}
							});

							$.append($$anchor, fragment_3);
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