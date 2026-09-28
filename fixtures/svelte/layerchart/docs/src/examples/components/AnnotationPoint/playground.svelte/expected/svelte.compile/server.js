import * as $ from 'svelte/internal/server';
import { Button, Field, Menu, MenuField, RangeField, Switch, Toggle } from 'svelte-ux';
import { AnnotationPoint, Circle, ScatterChart } from 'layerchart';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import { movable } from '$lib/attachments/movable.js';
import { getFaithful } from '$lib/data.remote';

const data = await getFaithful();

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
			'bottom-right',
			'smart'
		];

		const anchorOptions = ['start', 'middle', 'end'].map((v) => ({ label: v, value: v }));
		const linkTypeOptions = ['d3', 'straight', 'square', 'beveled', 'rounded', 'swoop'].map((v) => ({ label: v, value: v }));
		const linkSweepOptions = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((v) => ({ label: v, value: v }));

		const linkOrientationOptions = [
			{ label: 'horizontal', value: 'horizontal' },
			{ label: 'vertical', value: 'vertical' }
		];

		let dataX = 80;
		let dataY = 4.25;
		let placement = 'bottom-right';
		let xOffset = 50;
		let yOffset = 50;
		let radius = 60;
		let fontSize = 16;
		let labelGap = 2;
		let textAnchor = 'middle';
		let verticalAnchor = 'start';
		let showControls = true;
		let linkEnabled = true;
		let type = 'beveled';
		let curve = undefined;
		let sweep = 'horizontal-vertical';
		let orientation = 'horizontal';
		let linkRadius = 30;
		let bend = 22.5;

		const link = $.derived(() => linkEnabled
			? { type, curve, sweep, orientation, radius: linkRadius, bend }
			: false);

		// Sign of each offset on the label's pixel position (from AnnotationPoint's
		// labelProps math): left flips x, top flips y, other placements are +1.
		const signX = $.derived(() => placement.includes('left') ? -1 : 1);

		const signY = $.derived(() => placement.includes('top') ? -1 : 1);

		// Unit vector from ring center toward the placement direction.
		const dirX = $.derived(() => placement.includes('left') ? -1 : placement.includes('right') ? 1 : 0);

		const dirY = $.derived(() => placement.includes('top') ? -1 : placement.includes('bottom') ? 1 : 0);
		const dirMag = $.derived(() => Math.hypot(dirX(), dirY()) || 1);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-wrap gap-2 mb-2 screenshot-hidden">`);

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

			MenuField($$renderer, {
				label: 'Text Anchor',
				options: anchorOptions,
				stepper: true,
				classes: { menuIcon: 'hidden', root: 'flex-1 basis-40' },
				get value() {
					return textAnchor;
				},

				set value($$value) {
					textAnchor = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Vertical Anchor',
				options: anchorOptions,
				stepper: true,
				classes: { menuIcon: 'hidden', root: 'flex-1 basis-40' },
				get value() {
					return verticalAnchor;
				},

				set value($$value) {
					verticalAnchor = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap gap-2 mb-2 screenshot-hidden">`);

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

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Radius',
				min: 0,
				max: 200,
				classes: { root: 'flex-1 basis-40' },
				get value() {
					return radius;
				},

				set value($$value) {
					radius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Font size',
				min: 8,
				max: 48,
				classes: { root: 'flex-1 basis-40' },
				get value() {
					return fontSize;
				},

				set value($$value) {
					fontSize = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Label gap',
				min: 0,
				max: 20,
				classes: { root: 'flex-1 basis-40' },
				get value() {
					return labelGap;
				},

				set value($$value) {
					labelGap = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="flex flex-wrap gap-2 mb-2 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Link',
				class: 'w-26 shrink-0',
				children: ($$renderer) => {
					Switch($$renderer, {
						get checked() {
							return linkEnabled;
						},

						set checked($$value) {
							linkEnabled = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (linkEnabled) {
				$$renderer.push('<!--[0-->');

				MenuField($$renderer, {
					label: 'Link Type',
					options: linkTypeOptions,
					stepper: true,
					classes: { menuIcon: 'hidden', root: 'flex-1 basis-40' },
					get value() {
						return type;
					},

					set value($$value) {
						type = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				if (type === 'd3') {
					$$renderer.push('<!--[0-->');

					CurveMenuField($$renderer, {
						classes: { root: 'flex-1 basis-40' },
						get value() {
							return curve;
						},

						set value($$value) {
							curve = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					MenuField($$renderer, {
						label: 'Orientation',
						options: linkOrientationOptions,
						stepper: true,
						classes: { menuIcon: 'hidden', root: 'flex-1 basis-40' },
						get value() {
							return orientation;
						},

						set value($$value) {
							orientation = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (type === 'beveled' || type === 'rounded') {
					$$renderer.push('<!--[0-->');

					RangeField($$renderer, {
						label: 'Link Radius',
						min: 0,
						classes: { root: 'flex-1 basis-40' },
						get value() {
							return linkRadius;
						},

						set value($$value) {
							linkRadius = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (type === 'swoop') {
					$$renderer.push('<!--[0-->');

					RangeField($$renderer, {
						label: 'Bend (°)',
						min: -90,
						max: 90,
						classes: { root: 'flex-1 basis-40' },
						get value() {
							return bend;
						},

						set value($$value) {
							bend = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				MenuField($$renderer, {
					label: 'Link Sweep',
					options: linkSweepOptions,
					stepper: true,
					classes: { menuIcon: 'hidden', root: 'flex-1 basis-40' },
					get value() {
						return sweep;
					},

					set value($$value) {
						sweep = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			{
				function aboveMarks($$renderer, { context }) {
					const ringX = context.xScale(dataX);
					const ringY = context.yScale(dataY);

					AnnotationPoint($$renderer, {
						x: dataX,
						y: dataY,
						r: radius,
						label: placement,
						labelPlacement: placement,
						labelXOffset: xOffset,
						labelYOffset: yOffset,
						labelX: placement === 'smart' ? ringX + xOffset : undefined,
						labelY: placement === 'smart' ? ringY + yOffset : undefined,
						fontSize,
						labelGap,
						link: link(),
						props: {
							circle: { class: 'stroke-secondary' },
							label: {
								class: 'fill-secondary font-bold',
								...placement === 'smart' ? {} : { textAnchor, verticalAnchor }
							}
						}
					});

					$$renderer.push(`<!----> `);

					if (showControls) {
						$$renderer.push('<!--[0-->');

						const labelX = ringX + radius * dirX() / dirMag() + xOffset * signX();
						const labelY = ringY + radius * dirY() / dirMag() + yOffset * signY();

						Circle($$renderer, {
							cx: ringX,
							cy: ringY,
							r: 6,
							class: 'fill-secondary/20 stroke-secondary cursor-move [stroke-dasharray:3_3]'
						});

						$$renderer.push(`<!----> `);

						Circle($$renderer, {
							cx: labelX,
							cy: labelY,
							r: 6,
							class: 'fill-secondary/20 stroke-secondary cursor-move [stroke-dasharray:3_3]'
						});

						$$renderer.push(`<!----> `);

						Circle($$renderer, {
							cx: ringX + radius,
							cy: ringY,
							r: 6,
							class: 'fill-secondary/20 stroke-secondary cursor-ew-resize [stroke-dasharray:3_3]'
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				ScatterChart($$renderer, {
					data,
					x: 'waiting',
					y: 'eruptions',
					xNice: true,
					yNice: true,
					height: 400,
					padding: { top: 10, right: 10, bottom: 20, left: 30 },
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