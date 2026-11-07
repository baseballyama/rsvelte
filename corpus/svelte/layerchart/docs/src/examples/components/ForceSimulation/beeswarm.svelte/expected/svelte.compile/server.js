import * as $ from 'svelte/internal/server';
import { scaleOrdinal } from 'd3-scale';
import { forceX, forceY, forceCollide } from 'd3-force';
import { asAny, Axis, Chart, Circle, Layer, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import { getUsSenators } from '$lib/data.remote';

let usSenators = await getUsSenators();

export default function Beeswarm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const nodes = $.derived(() => usSenators);
		const genderColor = scaleOrdinal(['var(--color-info)', 'var(--color-warning)']);
		const xForce = forceX().strength(0.95);
		const yForce = forceY().strength(0.075);
		const collideForce = forceCollide();

		{
			function children($$renderer, { context }) {
				const r = 6;

				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', format: 'none', rule: true, grid: true });
						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { nodes }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(nodes);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let node = each_array[$$index];

									Circle($$renderer, {
										cx: node.x,
										cy: node.y,
										r,
										fill: genderColor(node.gender),
										class: 'stroke-surface-100',
										onpointermove: (e) => context.tooltip.show(e, node),
										onpointerleave: context.tooltip.hide
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							ForceSimulation($$renderer, {
								forces: {
									x: xForce.x((d) => context.xGet(asAny(d))),
									y: yForce.y(context.height / 2),
									collide: collideForce.radius(r)
								},
								data: { nodes: nodes() },
								static: true,
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.name)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Birth date',
											value: data.date_of_birth,
											format: 'day'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'State', value: data.state_name });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Party', value: data.party });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Gender', value: data.gender });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { context, children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			Chart($$renderer, {
				data: usSenators,
				x: (d) => d.date_of_birth.getFullYear(),
				xNice: true,
				padding: { bottom: 20, left: 12, right: 12 },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}
	});
}