import * as $ from 'svelte/internal/server';
import { Field, RangeField, Switch } from 'svelte-ux';
import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function AreaPlaygroundControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				pathGenerator: (x) => x,
				curve: undefined,
				pointCount: 10,
				showPoints: false,
				showLine: true,
				show: true,
				tweened: true
			},
			includeShowTween = true
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2 mb-4 screenshot-hidden"><div class="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2">`);

			PathDataMenuField($$renderer, {
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
				label: 'Show points',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return config.showPoints;
							},

							set checked($$value) {
								config.showPoints = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Show Line',
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

			$$renderer.push(`<!----></div> `);

			if (includeShowTween) {
				$$renderer.push(`<!--[0--><div class="grid grid-cols-[100px_auto_1fr] gap-2">`);

				Field($$renderer, {
					label: 'Show',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Switch($$renderer, {
								id,
								size: 'md',
								get checked() {
									return config.show;
								},

								set checked($$value) {
									config.show = $$value;
									$$settled = false;
								}
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					label: 'Tweened',
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

				$$renderer.push(`<!----></div>`);
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