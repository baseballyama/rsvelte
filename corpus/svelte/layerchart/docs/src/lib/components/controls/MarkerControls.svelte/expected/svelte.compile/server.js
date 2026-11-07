import * as $ from 'svelte/internal/server';
import { Field, RangeField, Switch } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';
import ShowField from './fields/ShowField.svelte';

export default function MarkerControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				show: false,
				tweened: true,
				markerStart: undefined,
				markerMid: undefined,
				markerEnd: undefined,
				pathGenerator: (x) => x,
				curve: undefined,
				pointCount: 10,
				amplitude: 1,
				frequency: 10,
				phase: 0
			}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[auto_auto_auto_auto_auto_1fr_1fr_1fr] gap-2 mb-2 screenshot-hidden">`);

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

			Field($$renderer, {
				label: 'Tween',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return config.tweened;
							},

							set checked($$value) {
								config.tweened = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			if (config.markerStart !== undefined) {
				$$renderer.push('<!--[0-->');

				Field($$renderer, {
					label: 'Start',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Switch($$renderer, {
								id,
								size: 'md',
								get checked() {
									return config.markerStart;
								},

								set checked($$value) {
									config.markerStart = $$value;
									$$settled = false;
								}
							});
						}
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (config.markerMid !== undefined) {
				$$renderer.push('<!--[0-->');

				Field($$renderer, {
					label: 'Mid',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Switch($$renderer, {
								id,
								size: 'md',
								get checked() {
									return config.markerMid;
								},

								set checked($$value) {
									config.markerMid = $$value;
									$$settled = false;
								}
							});
						}
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (config.markerEnd !== undefined) {
				$$renderer.push('<!--[0-->');

				Field($$renderer, {
					label: 'End',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Switch($$renderer, {
								id,
								size: 'md',
								get checked() {
									return config.markerEnd;
								},

								set checked($$value) {
									config.markerEnd = $$value;
									$$settled = false;
								}
							});
						}
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

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

			$$renderer.push(`<!----></div>`);
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