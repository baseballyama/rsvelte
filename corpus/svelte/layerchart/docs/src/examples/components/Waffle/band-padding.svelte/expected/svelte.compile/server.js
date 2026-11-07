import * as $ from 'svelte/internal/server';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function Band_padding($$renderer, $$props) {
	let bandPadding = 0.2;
	let unit = 5;

	const data = [
		{ fruit: 'Apple', count: 212 },
		{ fruit: 'Banana', count: 207 },
		{ fruit: 'Cherry', count: 315 },
		{ fruit: 'Date', count: 11 }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="grid grid-cols-[auto_1fr] gap-4 mb-4 screenshot-hidden">`);

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

						const each_array = $.ensure_array_like([1, 2, 5, 10, 25, 50, 100]);

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

		RangeField($$renderer, {
			label: 'Band padding',
			min: 0,
			max: 0.8,
			step: 0.05,
			format: 'decimal',
			get value() {
				return bandPadding;
			},

			set value($$value) {
				bandPadding = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> `);

		{
			function marks($$renderer) {
				Waffle($$renderer, { fill: 'var(--color-info)', unit, round: true, tooltip: true });
			}

			function tooltip($$renderer) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.fruit)}`);
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
										Tooltip.Item($$renderer, { label: 'Count', value: data.count, format: 'integer' });
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
				x: 'fruit',
				bandPadding,
				y: 'count',
				yDomain: [0, null],
				yNice: true,
				padding: { left: 36, bottom: 24, top: 8, right: 8 },
				height: 400,
				rule: true,
				grid: true,
				clip: true,
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
}