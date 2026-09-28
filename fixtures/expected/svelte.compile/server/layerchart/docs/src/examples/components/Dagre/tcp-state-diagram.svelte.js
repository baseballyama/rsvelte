import * as $ from 'svelte/internal/server';
import { curveLinear } from 'd3-shape';
import { cubicOut } from 'svelte/easing';
import { slide } from 'svelte/transition';
import { cls } from '@layerstack/tailwind';
import { Chart, Group, Layer, Rect, Spline, Text } from 'layerchart';
import { Dagre } from 'layerchart/graph';
import DagreControls from '$lib/components/controls/DagreControls.svelte';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
import ShowControls from '$lib/components/controls/fields/ShowField.svelte';
import { getTcpStateGraph } from '$lib/graph.remote';

let data = await getTcpStateGraph();

export default function Tcp_state_diagram($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let settings = {
			ranker: 'network-simplex',
			direction: 'top-bottom',
			align: 'none',
			nodeSeparation: 50,
			rankSeparation: 50,
			edgeSeparation: 10,
			edgeLabelPosition: 'center',
			edgeLabelOffset: 10,
			curve: curveLinear,
			arrow: 'triangle'
		};

		let showSettings = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ShowControls($$renderer, {
				label: 'Show Settings',
				get show() {
					return showSettings;
				},

				set show($$value) {
					showSettings = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="flex gap-2 pt-6">`);

			Chart($$renderer, {
				transform: {
					mode: 'canvas',
					initialScale: 0.75,
					initialTranslate: { x: 0, y: -110 },
					scrollMode: 'scale',
					motion: { type: 'tween', duration: 800, easing: cubicOut }
				},
				clip: true,
				height: 700,
				children: ($$renderer) => {
					TransformContextControls($$renderer, {});
					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						center: true,
						children: ($$renderer) => {
							{
								function children($$renderer, { nodes, edges }) {
									$$renderer.push(`<g class="edges"><!--[-->`);

									const each_array = $.ensure_array_like(edges);

									for (let i = 0, $$length = each_array.length; i < $$length; i++) {
										let edge = each_array[i];

										Spline($$renderer, {
											data: edge.points,
											x: 'x',
											y: 'y',
											class: 'stroke-surface-content opacity-30',
											motion: 'tween',
											curve: settings?.curve,
											markerEnd: settings.arrow
										});

										$$renderer.push(`<!---->`);

										Text($$renderer, {
											value: edge.label,
											x: edge.x,
											y: edge.y,
											textAnchor: 'middle',
											verticalAnchor: 'middle',
											class: 'stroke-2 stroke-surface-100',
											motion: 'tween'
										});

										$$renderer.push(`<!---->`);
									}

									$$renderer.push(`<!--]--></g><g class="nodes"><!--[-->`);

									const each_array_1 = $.ensure_array_like(nodes);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let node = each_array_1[$$index_1];

										Group($$renderer, {
											x: node.x - node.width / 2,
											y: node.y - node.height / 2,
											motion: 'tween',
											children: ($$renderer) => {
												Rect($$renderer, {
													width: node.width,
													height: node.height,
													class: cls('fill-surface-200 stroke-2 stroke-primary/50', node.label === 'CLOSED' && 'fill-danger/10 stroke-danger/50', node.label === 'ESTAB' && 'fill-success/10 stroke-success/50'),
													rx: 10
												});

												$$renderer.push(`<!---->`);

												Text($$renderer, {
													value: node.label,
													x: node.width / 2,
													y: node.height / 2,
													dy: -2,
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: cls('text-xs pointer-events-none')
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]--></g>`);
								}

								Dagre($$renderer, $.spread_props([
									{ data, edges: (d) => d.links },
									settings,
									{ children, $$slots: { default: true } }
								]));
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (showSettings) {
				$$renderer.push(`<!--[0--><div>`);

				DagreControls($$renderer, {
					get settings() {
						return settings;
					},

					set settings($$value) {
						settings = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}