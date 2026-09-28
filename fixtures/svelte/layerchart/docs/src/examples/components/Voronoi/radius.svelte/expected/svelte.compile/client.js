import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, ChartClipPath, Circle, Layer, Points, Voronoi } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';
import VoronoiControls from '$lib/components/controls/VoronoiControls.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Radius($$anchor, $$props) {
	$.push($$props, true);

	const data = getSpiral({
		angle: 137.5,
		radius: 10,
		count: 100,
		width: 500,
		height: 500
	});

	let point = $.state($.proxy({ x: 0, y: 0 }));

	function onPointerMove(e) {
		$.set(point, { x: e.offsetX, y: e.offsetY }, true);
	}

	let radius = $.state(0);
	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	VoronoiControls(node, {
		get radius() {
			return $.get(radius);
		},

		set radius($$value) {
			$.set(radius, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				onpointermove: onPointerMove,
				children: ($$anchor, $$slotProps) => {
					ChartClipPath($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							Points(node_2, { r: 2, class: 'fill-primary stroke-primary' });

							var node_3 = $.sibling(node_2, 2);

							{
								let $0 = $.derived(() => [
									{
										x: context().xScale?.invert?.($.get(point).x),
										y: context().yScale?.invert?.($.get(point).y)
									},
									...data
								]);

								Voronoi(node_3, {
									get data() {
										return $.get($0);
									},

									get r() {
										return $.get(radius);
									},

									classes: {
										path: 'pointer-events-none stroke-primary fill-primary/10 first:fill-primary/50'
									}
								});
							}

							var node_4 = $.sibling(node_3, 2);

							Circle(node_4, {
								get cx() {
									return $.get(point).x;
								},

								get cy() {
									return $.get(point).y;
								},
								r: 4,
								class: 'fill-primary'
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		Chart(node_1, {
			get data() {
				return data;
			},
			x: 'x',
			y: 'y',
			height: 400,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}