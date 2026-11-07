import * as $ from 'svelte/internal/server';
import { Chart, Dodge, Image, Tooltip } from 'layerchart';
import { getUsPresidents } from '$lib/data.remote';

const data = await getUsPresidents();

export default function Image_beeswarm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function marks($$renderer, { context }) {
				{
					function children($$renderer, { items }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let { data: p, x, y, r, index } = each_array[$$index];

							Image($$renderer, {
								href: p.portraitUrl,
								x,
								y,
								r,
								preserveAspectRatio: 'xMidYMid slice',
								class: 'cursor-pointer',
								onpointermove: (e) => context.tooltip.show(e, p),
								onpointerleave: context.tooltip.hide
							});
						}

						$$renderer.push(`<!--]-->`);
					}

					Dodge($$renderer, {
						axis: 'y',
						anchor: 'bottom',
						r: 18,
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
											label: 'Inaugurated',
											value: data.inaugurationDate,
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

										Tooltip.Item($$renderer, {
											label: 'Very favorable',
											value: `${$.stringify(data.veryFavorable)}%`
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Very unfavorable',
											value: `${$.stringify(data.veryUnfavorable)}%`
										});

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
				x: 'inaugurationDate',
				xNice: true,
				padding: { top: 12, bottom: 24, left: 12, right: 12 },
				height: 420,
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}