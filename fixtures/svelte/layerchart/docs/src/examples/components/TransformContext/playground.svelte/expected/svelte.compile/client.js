import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';
import { Chart, Circle, Layer, Points, Spline } from 'layerchart';
import TransformContextPlaygroundControls from '$lib/components/controls/TransformContextPlaygroundControls.svelte';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import { getSpiral } from '$lib/utils/data';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid place-items-center"><!></div>`, 1);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		pointCount: 500,
		angle: 137.5,
		showPoints: true,
		showPath: false,
		tweened: true,
		curve: undefined
	}));

	const data = $.derived(() => getSpiral({
		angle: $.get(config).angle,
		radius: 10,
		count: $.get(config).pointCount,
		width: 500,
		height: 500
	}));

	var fragment = root_1();
	var node = $.first_child(fragment);

	TransformContextPlaygroundControls(node, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	{
		let $0 = $.derived(() => ({
			mode: 'canvas',
			motion: $.get(config).tweened
				? { type: 'tween', duration: 800, easing: cubicOut }
				: undefined,
			scrollMode: 'scale'
		}));

		Chart(node_1, {
			get data() {
				return $.get(data);
			},
			x: 'x',
			y: 'y',
			get transform() {
				return $.get($0);
			},
			clip: true,
			padding: 50,
			width: 500,
			height: 500,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_2 = $.first_child(fragment_1);

				TransformContextControls(node_2, {});

				var node_3 = $.sibling(node_2, 2);

				Layer(node_3, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_4 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								Spline($$anchor, {
									get curve() {
										return $.get(config).curve;
									},
									motion: 'tween'
								});
							};

							$.if(node_4, ($$render) => {
								if ($.get(config).showPath) $$render(consequent);
							});
						}

						var node_5 = $.sibling(node_4, 2);

						{
							var consequent_1 = ($$anchor) => {
								{
									const children = ($$anchor, $$arg0) => {
										let points = () => ($$arg0?.()).points;
										var fragment_5 = $.comment();
										var node_6 = $.first_child(fragment_5);

										$.each(node_6, 17, points, $.index, ($$anchor, point, index) => {
											{
												let $0 = $.derived(() => $.get(config).tweened ? 'tween' : undefined);

												Circle($$anchor, {
													get cx() {
														return $.get(point).x;
													},

													get cy() {
														return $.get(point).y;
													},
													r: 2,
													class: index % 2 ? 'fill-primary' : 'fill-secondary',
													get motion() {
														return $.get($0);
													}
												});
											}
										});

										$.append($$anchor, fragment_5);
									};

									Points($$anchor, { children, $$slots: { default: true } });
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}