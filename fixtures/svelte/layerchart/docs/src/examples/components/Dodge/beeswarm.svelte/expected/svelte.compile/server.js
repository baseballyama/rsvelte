import * as $ from 'svelte/internal/server';
import { Chart, Circle, Dodge, Tooltip } from 'layerchart';
import { getUsSenators } from '$lib/data.remote';

const data = await getUsSenators();

export default function Beeswarm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function marks($$renderer, { context }) {
				{
					function children($$renderer, { items }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let { data: senator, x, y, r, index } = each_array[$$index];

							Circle($$renderer, {
								data: [senator],
								cx: x,
								cy: y,
								r,
								fill: 'gender',
								class: 'stroke-surface-100',
								onpointermove: (e) => context.tooltip.show(e, senator),
								onpointerleave: context.tooltip.hide
							});
						}

						$$renderer.push(`<!--]-->`);
					}

					Dodge($$renderer, {
						axis: 'y',
						anchor: 'middle',
						r: 6,
						padding: 1,
						children,
						$$slots: { default: true }
					});
				}
			}

			function tooltip($$renderer, { context }) {
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
				data,
				x: (d) => d.date_of_birth.getFullYear(),
				xNice: true,
				c: 'gender',
				cRange: ['var(--color-info)', 'var(--color-warning)'],
				padding: { bottom: 20, left: 12, right: 12 },
				height: 300,
				axis: 'x',
				props: { xAxis: { format: 'none' } },
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}