import * as $ from 'svelte/internal/server';
import { Field, RangeField, MenuField, Switch } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function LinkControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			type = 'd3',
			curve = undefined,
			sweep = 'horizontal-vertical',
			orientation = 'horizontal',
			radius = 60,
			bend = 22.5,
			showMiddle = false
		} = $$props;

		const typeOptions = ['d3', 'straight', 'square', 'beveled', 'rounded', 'swoop'].map((type) => ({ label: type, value: type }));
		const sweepOptions = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((sweep) => ({ label: sweep, value: sweep }));

		const orientationOptions = [
			{ label: 'horizontal', value: 'horizontal' },
			{ label: 'vertical', value: 'vertical' }
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-2 gap-2 mb-2 screenshot-hidden">`);

			MenuField($$renderer, {
				label: 'Link Type',
				options: typeOptions,
				stepper: true,
				classes: { menuIcon: 'hidden' },
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
					get value() {
						return curve;
					},

					set value($$value) {
						curve = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (type === 'beveled' || type === 'rounded') {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'Radius',
					min: 0,
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

			$$renderer.push(`<!--]--> `);

			if (type === 'swoop') {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'Bend (°)',
					min: -90,
					max: 90,
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

			$$renderer.push(`<!--]--></div> <div class="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 screenshot-hidden">`);

			if (type === 'd3') {
				$$renderer.push('<!--[0-->');

				MenuField($$renderer, {
					label: 'Orientation',
					options: orientationOptions,
					stepper: true,
					classes: { menuIcon: 'hidden' },
					get value() {
						return orientation;
					},

					set value($$value) {
						orientation = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			MenuField($$renderer, {
				label: 'Link Sweep',
				options: sweepOptions,
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return sweep;
				},

				set value($$value) {
					sweep = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Middle',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return showMiddle;
							},

							set checked($$value) {
								showMiddle = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { type, curve, sweep, orientation, radius, bend, showMiddle });
	});
}