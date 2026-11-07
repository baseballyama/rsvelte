import * as $ from 'svelte/internal/server';
import { Pane, List, Checkbox, ThemeUtils } from 'svelte-tweakpane-ui';

export default function Settings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { controls = '<OrbitControls>', autoPauseControls = true } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				theme: ThemeUtils.presets.light,
				position: 'fixed',
				title: 'TransformControls',
				children: ($$renderer) => {
					List($$renderer, {
						label: 'Camera Controls',
						options: {
							'<OrbitControls>': '<OrbitControls>',
							'<TrackballControls>': '<TrackballControls>',
							'<CameraControls>': '<CameraControls>'
						},

						get value() {
							return controls;
						},

						set value($$value) {
							controls = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'autoPauseControls',
						get value() {
							return autoPauseControls;
						},

						set value($$value) {
							autoPauseControls = $$value;
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
		$.bind_props($$props, { controls, autoPauseControls });
	});
}