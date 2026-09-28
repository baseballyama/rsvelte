import * as $ from 'svelte/internal/server';
import { Chart, Vector, Polygon, Layer, Text } from 'layerchart';
import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function Shapes($$renderer) {
	let length = 30;
	let rotate = 30;
	let width = 8;
	let anchor = 'middle';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="grid gap-2 mb-2 screenshot-hidden"><div class="grid grid-cols-3 gap-3">`);

		RangeField($$renderer, {
			label: 'Length',
			min: 10,
			max: 60,
			step: 1,
			get value() {
				return length;
			},

			set value($$value) {
				length = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		RangeField($$renderer, {
			label: 'Width',
			min: 1,
			max: 30,
			step: 1,
			get value() {
				return width;
			},

			set value($$value) {
				width = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		RangeField($$renderer, {
			label: 'Rotate',
			min: 0,
			max: 360,
			step: 1,
			get value() {
				return rotate;
			},

			set value($$value) {
				rotate = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> `);

		Field($$renderer, {
			label: 'Anchor',
			children: ($$renderer) => {
				ToggleGroup($$renderer, {
					variant: 'outline',
					size: 'sm',
					inset: true,
					class: 'w-full',
					get value() {
						return anchor;
					},

					set value($$value) {
						anchor = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ToggleOption($$renderer, {
							value: 'start',
							children: ($$renderer) => {
								$$renderer.push(`<!---->start`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'middle',
							children: ($$renderer) => {
								$$renderer.push(`<!---->middle`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToggleOption($$renderer, {
							value: 'end',
							children: ($$renderer) => {
								$$renderer.push(`<!---->end`);
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

		Chart($$renderer, {
			padding: { top: 20, bottom: 10, left: 10, right: 10 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Text($$renderer, {
							x: 45,
							y: 16,
							textAnchor: 'middle',
							class: 'text-xs fill-surface-content/50',
							children: ($$renderer) => {
								$$renderer.push(`<!---->arrow`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Vector($$renderer, {
							x: 45,
							y: 120,
							length,
							rotate,
							anchor,
							class: 'stroke-primary'
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: 125,
							y: 16,
							textAnchor: 'middle',
							class: 'text-xs fill-surface-content/50',
							children: ($$renderer) => {
								$$renderer.push(`<!---->arrow (width)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Vector($$renderer, {
							x: 125,
							y: 120,
							length,
							rotate,
							width,
							anchor,
							class: 'stroke-secondary'
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: 215,
							y: 16,
							textAnchor: 'middle',
							class: 'text-xs fill-surface-content/50',
							children: ($$renderer) => {
								$$renderer.push(`<!---->spike`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Vector($$renderer, {
							x: 215,
							y: 120,
							length,
							rotate,
							anchor,
							shape: 'spike',
							class: 'stroke-danger fill-danger/25'
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: 305,
							y: 16,
							textAnchor: 'middle',
							class: 'text-xs fill-surface-content/50',
							children: ($$renderer) => {
								$$renderer.push(`<!---->spike (width)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Vector($$renderer, {
							x: 305,
							y: 120,
							length,
							rotate,
							anchor,
							shape: 'spike',
							width,
							class: 'stroke-danger fill-danger/25'
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: 395,
							y: 16,
							textAnchor: 'middle',
							class: 'text-xs fill-surface-content/50',
							children: ($$renderer) => {
								$$renderer.push(`<!---->custom`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { length: len }) {
								$$renderer.push(`<line${$.attr('x1', 0)}${$.attr('y1', 0)}${$.attr('x2', 0)}${$.attr('y2', -len)} class="stroke-success"${$.attr('stroke-width', 2)}></line><circle${$.attr('cx', 0)}${$.attr('cy', -len)}${$.attr('r', 4)} class="fill-success"></circle>`);
							}

							Vector($$renderer, {
								x: 395,
								y: 120,
								length,
								rotate,
								anchor,
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: 480,
							y: 16,
							textAnchor: 'middle',
							class: 'text-xs fill-surface-content/50',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Polygon arrow`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { length: len }) {
								const s = len / 2;

								Polygon($$renderer, {
									points: [
										{ x: 0, y: -s },
										{ x: -s / 2, y: 0 },
										{ x: -s / 4, y: 0 },
										{ x: -s / 4, y: s },
										{ x: s / 4, y: s },
										{ x: s / 4, y: 0 },
										{ x: s / 2, y: 0 },
										{ x: 0, y: -s }
									],
									class: 'fill-warning/50 stroke-warning'
								});
							}

							Vector($$renderer, {
								x: 480,
								y: 120,
								length,
								rotate,
								anchor,
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: 570,
							y: 16,
							textAnchor: 'middle',
							class: 'text-xs fill-surface-content/50',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Polygon star`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { length: len }) {
								Polygon($$renderer, {
									r: len * 0.35,
									points: 6,
									inset: 0.7,
									rotate: 30,
									class: 'fill-info/50 stroke-info'
								});
							}

							Vector($$renderer, {
								x: 570,
								y: 120,
								length,
								rotate,
								anchor,
								children,
								$$slots: { default: true }
							});
						}

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
}