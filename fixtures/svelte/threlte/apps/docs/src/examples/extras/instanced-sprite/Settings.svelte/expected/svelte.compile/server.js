import * as $ from 'svelte/internal/server';
import { Checkbox, Pane, Slider, ThemeUtils } from 'svelte-tweakpane-ui';

export default function Settings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { billboarding = void 0, fps = void 0 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				theme: ThemeUtils.presets.light,
				position: 'fixed',
				title: 'InstancedSprite',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'billboarding',
						get value() {
							return billboarding;
						},

						set value($$value) {
							billboarding = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'fps',
						min: 1,
						max: 30,
						step: 1,
						get value() {
							return fps;
						},

						set value($$value) {
							fps = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { billboarding, fps });
	});
}