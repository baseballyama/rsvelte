import * as $ from 'svelte/internal/server';
import { Button, Field, Menu, RangeField, Toggle } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';

export default function AnnotationRangePointLineControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			placement = undefined,
			xOffset = undefined,
			yOffset = undefined,
			radius = undefined
		} = $$props;

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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(cls('grid gap-2 mb-4 screenshot-hidden', radius !== undefined ? 'grid-cols-4' : 'grid-cols-3')))}>`);

			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle }) => {
						Field($$renderer, {
							label: 'Placement',
							class: 'cursor-pointer',
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
				min: -20,
				max: 20,
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
				min: -20,
				max: 20,
				get value() {
					return yOffset;
				},

				set value($$value) {
					yOffset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (radius !== undefined) {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'Radius',
					max: 10,
					get value() {
						return radius;
					},

					set value($$value) {
						radius = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { placement, xOffset, yOffset, radius });
	});
}