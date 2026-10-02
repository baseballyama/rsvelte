import * as $ from 'svelte/internal/server';
import { Field, RangeField, Switch } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import PathDataMenuField from '$lib/components/controls/fields/PathDataMenuField.svelte';
import ShowField from '$lib/components/controls/fields/ShowField.svelte';

export default function MotionPathControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				pointCount: 100,
				pathGenerator: (x) => x,
				curve: undefined,
				amplitude: 1,
				frequency: 10,
				phase: 0,
				show: false,
				duration: '5s',
				repeatCount: 'indefinite',
				start: undefined
			}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 mb-4 screenshot-hidden">`);

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