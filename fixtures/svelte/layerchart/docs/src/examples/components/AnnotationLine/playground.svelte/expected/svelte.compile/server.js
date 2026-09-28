import * as $ from 'svelte/internal/server';
import { Button, Field, Menu, RangeField, Switch, Toggle } from 'svelte-ux';
import { AnnotationLine, Circle, LineChart } from 'layerchart';
import { movable } from '$lib/attachments/movable.js';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const placementOptions = [
			'top-left',
			'top',
			'top-right',
			'left',
			'center',
			'right',
			'bottom-left',
			'bottom',
			'bottom-right'
		];

		let x1 = new Date('2009-01-01');
		let y1 = 200;
		let x2 = new Date('2010-12-31');
		let y2 = 600;
		let placement = 'top';
		let xOffset = 0;
		let yOffset = 0;
		let showControls = true;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-wrap gap-2 mb-2 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Show controls',
				class: 'w-26 shrink-0',
				children: ($$renderer) => {
					Switch($$renderer, {
						get checked() {
							return showControls;
						},

						set checked($$value) {
							showControls = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle }) => {
						Field($$renderer, {
							label: 'Placement',
							class: 'cursor-pointer flex-1 basis-40',
							children: ($$renderer) => {
								$$renderer.push(`<span class="text-sm">${$.escape(placement)}</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Menu($$renderer, {
							open,
							placement: 'bottom-start',
							children: ($$renderer) => {
								$$renderer.push(`<div class="grid grid-cols-3 gap-1 p-1"><!--[-->`);

								const each_array = $.ensure_array_like(placementOptions);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let option = each_array[$$index];

									Button($$renderer, {
										variant: 'outline',
										color: option === placement ? 'primary' : 'default',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(option)}`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'X offset',
				min: -100,
				max: 100,
				classes: { root: 'flex-1 basis-40' },
				get value() {
					return xOffset;
				},

				set value($$value) {
					xOffset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Y offset',
				min: -100,
				max: 100,
				classes: { root: 'flex-1 basis-40' },
				get value() {
					return yOffset;
				},

				set value($$value) {
					yOffset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			{
				function aboveMarks($$renderer, { context }) {
					AnnotationLine($$renderer, {
						x1,
						y1,
						x2,
						y2,
						label: placement,
						labelPlacement: placement,
						labelXOffset: xOffset,
						labelYOffset: yOffset,
						props: {
							line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
							label: { fill: 'var(--color-danger)' }
						}
					});

					$$renderer.push(`<!----> `);

					if (showControls) {
						$$renderer.push('<!--[0-->');

						const xScale = context.xScale;
						const yScale = context.yScale;
						const xInvert = context.xScale.invert;
						const yInvert = context.yScale.invert;

						Circle($$renderer, {
							cx: xScale(x1),
							cy: yScale(y1),
							r: 6,
							class: 'fill-danger/20 stroke-danger cursor-move [stroke-dasharray:3_3]'
						});

						$$renderer.push(`<!----> `);

						Circle($$renderer, {
							cx: xScale(x2),
							cy: yScale(y2),
							r: 6,
							class: 'fill-danger/20 stroke-danger cursor-move [stroke-dasharray:3_3]'
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				LineChart($$renderer, {
					data,
					x: 'date',
					y: 'value',
					height: 300,
					padding: { top: 10, bottom: 20, left: 25 },
					tooltipContext: false,
					aboveMarks,
					$$slots: { aboveMarks: true }
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