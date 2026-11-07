import * as $ from 'svelte/internal/server';
import { Link, Chart, Circle, Layer } from 'layerchart';
import LinkPlaygroundControls from '$lib/components/controls/LinkControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import { movable } from '$lib/attachments/movable.js';

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let source = { x: 300, y: 150 };
		let middle = { x: 420, y: 240 };
		let target = { x: 500, y: 300 };
		let showMiddle = false;
		let type = 'd3';
		let curve = undefined;
		let sweep = 'horizontal-vertical';
		let orientation = 'horizontal';
		let radius = 60;
		let bend = 22.5;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			LinkPlaygroundControls($$renderer, {
				get type() {
					return type;
				},

				set type($$value) {
					type = $$value;
					$$settled = false;
				},

				get curve() {
					return curve;
				},

				set curve($$value) {
					curve = $$value;
					$$settled = false;
				},

				get sweep() {
					return sweep;
				},

				set sweep($$value) {
					sweep = $$value;
					$$settled = false;
				},

				get orientation() {
					return orientation;
				},

				set orientation($$value) {
					orientation = $$value;
					$$settled = false;
				},

				get radius() {
					return radius;
				},

				set radius($$value) {
					radius = $$value;
					$$settled = false;
				},

				get bend() {
					return bend;
				},

				set bend($$value) {
					bend = $$value;
					$$settled = false;
				},

				get showMiddle() {
					return showMiddle;
				},

				set showMiddle($$value) {
					showMiddle = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				padding: { left: 16, bottom: 24 },
				height: 400,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							if (showMiddle) {
								$$renderer.push('<!--[0-->');

								Link($$renderer, {
									x1: source.x,
									y1: source.y,
									x2: middle.x,
									y2: middle.y,
									sweep,
									type,
									radius,
									bend,
									curve,
									orientation,
									class: 'stroke-primary stroke-4'
								});

								$$renderer.push(`<!----> `);

								Link($$renderer, {
									x1: middle.x,
									y1: middle.y,
									x2: target.x,
									y2: target.y,
									sweep,
									type,
									radius,
									bend,
									curve,
									orientation,
									class: 'stroke-primary stroke-4'
								});

								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push('<!--[-1-->');

								Link($$renderer, {
									x1: source.x,
									y1: source.y,
									x2: target.x,
									y2: target.y,
									sweep,
									type,
									radius,
									bend,
									curve,
									orientation,
									class: 'stroke-primary stroke-4'
								});
							}

							$$renderer.push(`<!--]--> `);

							Circle($$renderer, {
								cx: source.x,
								cy: source.y,
								r: 10,
								class: 'cursor-grab fill-surface-200 stroke-4 stroke-info'
							});

							$$renderer.push(`<!----> `);

							if (showMiddle) {
								$$renderer.push('<!--[0-->');

								Circle($$renderer, {
									cx: middle.x,
									cy: middle.y,
									r: 10,
									class: 'cursor-grab fill-primary/50'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							Circle($$renderer, {
								cx: target.x,
								cy: target.y,
								r: 10,
								class: 'cursor-grab fill-surface-200 stroke-4 stroke-accent'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}