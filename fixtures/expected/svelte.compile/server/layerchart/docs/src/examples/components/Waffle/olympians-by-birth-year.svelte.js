import * as $ from 'svelte/internal/server';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { rollup } from 'd3-array';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
import { getOlympians } from '$lib/data.remote';

const olympians = await getOlympians();

export default function Olympians_by_birth_year($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let unit = 50;
		let round = false;
		const unitOptions = [1, 2, 5, 10, 25, 50, 100];

		// Bin athletes by 5-year birth periods (1980, 1985, 1990, ...)
		const data = Array.from(
			rollup(olympians.filter((d) => d.date_of_birth), (v) => v.length, (d) => {
				const year = new Date(d.date_of_birth).getUTCFullYear();

				return Math.floor(year / 5) * 5;
			}),
			([year, count]) => ({ year, count })
		).sort((a, b) => a.year - b.year);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[auto_auto_1fr] gap-4 mb-4 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Cells per unit',
				dense: true,
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						get value() {
							return unit;
						},

						set value($$value) {
							unit = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(unitOptions);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let opt = each_array[$$index];

								ToggleOption($$renderer, {
									value: opt,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(opt)}`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Round',
				dense: true,
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						get value() {
							return round;
						},

						set value($$value) {
							round = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: false,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Off`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->On`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			{
				function marks($$renderer) {
					Waffle($$renderer, { fill: 'var(--color-info)', unit, round, tooltip: true });
				}

				function tooltip($$renderer) {
					{
						function children($$renderer, { data }) {
							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(data.year)}–${$.escape(data.year + 4)}`);
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
											Tooltip.Item($$renderer, { label: 'Athletes', value: data.count, format: 'integer' });
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
							Tooltip.Root($$renderer, { children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				Chart($$renderer, {
					data,
					x: 'year',
					bandPadding: 0.2,
					y: 'count',
					yDomain: [0, null],
					yNice: true,
					padding: { left: 36, bottom: 24, top: 8, right: 8 },
					height: 400,
					rule: true,
					grid: true,
					marks,
					tooltip,
					$$slots: { marks: true, tooltip: true }
				});
			}

			$$renderer.push(`<!---->`);
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