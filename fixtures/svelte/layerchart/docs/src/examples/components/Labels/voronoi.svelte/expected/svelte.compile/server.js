import * as $ from 'svelte/internal/server';
import { range } from 'd3-array';
import { randomNormal } from 'd3-random';
import { Field, RangeField, SelectField, Switch } from 'svelte-ux';
import { Chart, Labels, Layer, Points, Voronoi } from 'layerchart';

export default function Voronoi_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const width = 900;
		const height = 600;
		const randomX = randomNormal(width / 2, 110);
		const randomY = randomNormal(height / 2, 95);
		const data = range(110).map((i) => ({ i, x: randomX(), y: randomY() })).filter((d) => d.x >= 0 && d.x <= width && d.y >= 0 && d.y <= height);

		const linkTypeOptions = [
			{ label: 'Straight', value: 'straight' },
			{ label: 'Swoop', value: 'swoop' },
			{ label: 'Rounded', value: 'rounded' },
			{ label: 'Square', value: 'square' },
			{ label: 'Beveled', value: 'beveled' }
		];

		let linkType = 'straight';
		let useLinks = true;
		let occludeLabels = true;
		let spacing = 2;
		let showVoronoi = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-4 mb-2 screenshot-hidden">`);

			SelectField($$renderer, {
				label: 'Links',
				options: linkTypeOptions,
				clearable: false,
				toggleIcon: null,
				stepper: true,
				class: 'w-60',
				get value() {
					return linkType;
				},

				set value($$value) {
					linkType = $$value;
					$$settled = false;
				},

				$$slots: {
					append: ($$renderer) => {
						$$renderer.push(`<div slot="append" class="flex items-center pl-2" role="none">`);

						Switch($$renderer, {
							size: 'md',
							get checked() {
								return useLinks;
							},

							set checked($$value) {
								useLinks = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Occlude',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						$$renderer.push(`<div class="flex items-center gap-2 w-60">`);

						RangeField($$renderer, {
							min: 0,
							max: 50,
							disabled: !occludeLabels,
							class: 'flex-1',
							get value() {
								return spacing;
							},

							set value($$value) {
								spacing = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Switch($$renderer, {
							size: 'md',
							id,
							get checked() {
								return occludeLabels;
							},

							set checked($$value) {
								occludeLabels = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Show voronoi',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							get checked() {
								return showVoronoi;
							},

							set checked($$value) {
								showVoronoi = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				data,
				x: 'x',
				xDomain: [0, width],
				y: 'y',
				yDomain: [0, height],
				padding: 16,
				height: 500,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							if (showVoronoi) {
								$$renderer.push('<!--[0-->');
								Voronoi($$renderer, { classes: { path: 'stroke-surface-content/20' } });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);
							Points($$renderer, { r: 2, class: 'fill-surface-content' });
							$$renderer.push(`<!----> `);

							Labels($$renderer, {
								value: (d) => d.i,
								layout: 'voronoi',
								links: useLinks
									? { type: linkType, class: 'stroke-surface-content/40' }
									: false,
								occlude: occludeLabels ? { padding: spacing } : false,
								fontSize: 10,
								class: 'fill-surface-content pointer-events-none'
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
		$.bind_props($$props, { data });
	});
}