import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Rect } from 'layerchart';
import { Field, MenuField, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let valueMode = 'pixel';
		let propsMode = 'position-size';
		let pixelPosition = { x: 80, y: 56, width: 240, height: 160 };
		let dataPosition = { x: 20, y: 25, width: 240, height: 160 };
		let pixelEdges = { x0: 80, y0: 56, x1: 320, y1: 216 };
		let dataEdges = { x0: 18, y0: 18, x1: 82, y1: 78 };
		let corners = { topLeft: 32, topRight: 8, bottomRight: 40, bottomLeft: 16 };

		const propsOptions = [
			{ label: 'x / y / width / height', value: 'position-size' },
			{ label: 'x0 / y0 / x1 / y1', value: 'edges' }
		];

		const data = $.derived(() => [propsMode === 'position-size' ? dataPosition : dataEdges]);
		const x = $.derived(() => propsMode === 'position-size' ? 'x' : ['x0', 'x1']);
		const y = $.derived(() => propsMode === 'position-size' ? 'y' : ['y0', 'y1']);
		let context = void 0;
		let previousValueMode = valueMode;

		function toPixel(scale, value) {
			return Math.round(Number(scale?.(value) ?? value));
		}

		function toData(scale, value) {
			return Math.round(Number(scale?.invert?.(value) ?? value));
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-2 gap-2 mb-2 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Mode',
				classes: { input: 'mt-[6px] mb-1' },
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return valueMode;
						},

						set value($$value) {
							valueMode = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'data',
								children: ($$renderer) => {
									$$renderer.push(`<!---->data`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'pixel',
								children: ($$renderer) => {
									$$renderer.push(`<!---->pixel`);
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

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Props',
				options: propsOptions,
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return propsMode;
				},

				set value($$value) {
					propsMode = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-4 gap-2 mb-2 screenshot-hidden">`);

			if (propsMode === 'position-size' && valueMode === 'pixel') {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'x',
					min: 0,
					max: 360,
					get value() {
						return pixelPosition.x;
					},

					set value($$value) {
						pixelPosition.x = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'y',
					min: 0,
					max: 220,
					get value() {
						return pixelPosition.y;
					},

					set value($$value) {
						pixelPosition.y = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'width',
					min: 20,
					max: 360,
					get value() {
						return pixelPosition.width;
					},

					set value($$value) {
						pixelPosition.width = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'height',
					min: 20,
					max: 240,
					get value() {
						return pixelPosition.height;
					},

					set value($$value) {
						pixelPosition.height = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			} else if (propsMode === 'position-size') {
				$$renderer.push('<!--[1-->');

				RangeField($$renderer, {
					label: 'x',
					min: 0,
					max: 100,
					get value() {
						return dataPosition.x;
					},

					set value($$value) {
						dataPosition.x = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'y',
					min: 0,
					max: 100,
					get value() {
						return dataPosition.y;
					},

					set value($$value) {
						dataPosition.y = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'width',
					min: 20,
					max: 360,
					get value() {
						return dataPosition.width;
					},

					set value($$value) {
						dataPosition.width = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'height',
					min: 20,
					max: 240,
					get value() {
						return dataPosition.height;
					},

					set value($$value) {
						dataPosition.height = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			} else if (valueMode === 'pixel') {
				$$renderer.push('<!--[2-->');

				RangeField($$renderer, {
					label: 'x0',
					min: 0,
					max: 400,
					get value() {
						return pixelEdges.x0;
					},

					set value($$value) {
						pixelEdges.x0 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'y0',
					min: 0,
					max: 260,
					get value() {
						return pixelEdges.y0;
					},

					set value($$value) {
						pixelEdges.y0 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'x1',
					min: 0,
					max: 400,
					get value() {
						return pixelEdges.x1;
					},

					set value($$value) {
						pixelEdges.x1 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'y1',
					min: 0,
					max: 260,
					get value() {
						return pixelEdges.y1;
					},

					set value($$value) {
						pixelEdges.y1 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');

				RangeField($$renderer, {
					label: 'x0',
					min: 0,
					max: 100,
					get value() {
						return dataEdges.x0;
					},

					set value($$value) {
						dataEdges.x0 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'y0',
					min: 0,
					max: 100,
					get value() {
						return dataEdges.y0;
					},

					set value($$value) {
						dataEdges.y0 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'x1',
					min: 0,
					max: 100,
					get value() {
						return dataEdges.x1;
					},

					set value($$value) {
						dataEdges.x1 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'y1',
					min: 0,
					max: 100,
					get value() {
						return dataEdges.y1;
					},

					set value($$value) {
						dataEdges.y1 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></div> <div class="grid grid-cols-4 gap-2 mb-2 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'topLeft',
				min: 0,
				max: 80,
				get value() {
					return corners.topLeft;
				},

				set value($$value) {
					corners.topLeft = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'topRight',
				min: 0,
				max: 80,
				get value() {
					return corners.topRight;
				},

				set value($$value) {
					corners.topRight = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'bottomRight',
				min: 0,
				max: 80,
				get value() {
					return corners.bottomRight;
				},

				set value($$value) {
					corners.bottomRight = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'bottomLeft',
				min: 0,
				max: 80,
				get value() {
					return corners.bottomLeft;
				},

				set value($$value) {
					corners.bottomLeft = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				data: data(),
				x: x(),
				y: y(),
				xDomain: [0, 100],
				yDomain: [0, 100],
				padding: { top: 16, right: 16, bottom: 24, left: 28 },
				height: 340,
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'left', rule: true });
							$$renderer.push(`<!----> `);

							if (propsMode === 'position-size' && valueMode === 'pixel') {
								$$renderer.push('<!--[0-->');
								Rect($$renderer, $.spread_props([pixelPosition, { corners, fill: 'var(--color-primary)' }]));
							} else if (propsMode === 'position-size') {
								$$renderer.push('<!--[1-->');

								Rect($$renderer, {
									x: 'x',
									y: 'y',
									width: 'width',
									height: 'height',
									corners,
									fill: 'var(--color-primary)'
								});
							} else if (valueMode === 'pixel') {
								$$renderer.push('<!--[2-->');
								Rect($$renderer, $.spread_props([pixelEdges, { corners, fill: 'var(--color-primary)' }]));
							} else {
								$$renderer.push('<!--[-1-->');

								Rect($$renderer, {
									x0: 'x0',
									y0: 'y0',
									x1: 'x1',
									y1: 'y1',
									corners,
									fill: 'var(--color-primary)'
								});
							}

							$$renderer.push(`<!--]-->`);
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