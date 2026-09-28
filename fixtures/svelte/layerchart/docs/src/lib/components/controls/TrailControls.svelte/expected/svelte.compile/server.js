import * as $ from 'svelte/internal/server';

import {
	Field,
	MenuField,
	RangeField,
	Switch,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';
import ShowField from './fields/ShowField.svelte';

export default function TrailControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				show: false,
				pathGenerator: (x) => x,
				amplitude: 1,
				frequency: 10,
				phase: 0,
				curve: undefined,
				cap: 'round',
				pointCount: 30,
				showLine: false,
				motion: undefined
			}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 screenshot-hidden">`);

			ShowField($$renderer, {
				inline: true,
				get show() {
					return config.show;
				},

				set show($$value) {
					config.show = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			PathDataMenuField($$renderer, {
				amplitude: config.amplitude,
				frequency: config.frequency,
				phase: config.phase,
				get value() {
					return config.pathGenerator;
				},

				set value($$value) {
					config.pathGenerator = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			CurveMenuField($$renderer, {
				get value() {
					return config.curve;
				},

				set value($$value) {
					config.curve = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Cap',
				options: [
					{ label: 'round', value: 'round' },
					{ label: 'butt', value: 'butt' }
				],
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return config.cap;
				},

				set value($$value) {
					config.cap = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (config.motion !== undefined) {
				$$renderer.push('<!--[0-->');

				Field($$renderer, {
					label: 'Show line',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Switch($$renderer, {
								id,
								size: 'md',
								get checked() {
									return config.showLine;
								},

								set checked($$value) {
									config.showLine = $$value;
									$$settled = false;
								}
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'Points',
					min: 2,
					get value() {
						return config.pointCount;
					},

					set value($$value) {
						config.pointCount = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					label: 'Motion',
					classes: { input: 'mt-1 mb-[6px]' },
					children: ($$renderer) => {
						ToggleGroup($$renderer, {
							variant: 'outline',
							size: 'sm',
							get value() {
								return config.motion;
							},

							set value($$value) {
								config.motion = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								ToggleOption($$renderer, {
									value: 'none',
									children: ($$renderer) => {
										$$renderer.push(`<!---->none`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ToggleOption($$renderer, {
									value: 'tween',
									children: ($$renderer) => {
										$$renderer.push(`<!---->tween`);
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

				$$renderer.push(`<!---->`);
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
		$.bind_props($$props, { config });
	});
}