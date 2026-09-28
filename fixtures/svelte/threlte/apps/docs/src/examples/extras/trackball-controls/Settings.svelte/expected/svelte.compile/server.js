import * as $ from 'svelte/internal/server';
import { Checkbox, Pane, ThemeUtils, Slider } from 'svelte-tweakpane-ui';

export default function Settings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			staticMoving = void 0,
			noRotate = void 0,
			rotateSpeed = void 0,
			noZoom = void 0,
			zoomSpeed = void 0,
			noPan = void 0,
			panSpeed = void 0
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				theme: ThemeUtils.presets.light,
				position: 'fixed',
				title: 'TrackballControls',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'staticMoving',
						get value() {
							return staticMoving;
						},

						set value($$value) {
							staticMoving = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'noRotate',
						get value() {
							return noRotate;
						},

						set value($$value) {
							noRotate = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'noPan',
						get value() {
							return noPan;
						},

						set value($$value) {
							noPan = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'noZoom',
						get value() {
							return noZoom;
						},

						set value($$value) {
							noZoom = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'rotateSpeed',
						min: 0.1,
						max: 2,
						step: 0.1,
						get value() {
							return rotateSpeed;
						},

						set value($$value) {
							rotateSpeed = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'panSpeed',
						min: 0.05,
						max: 1.0,
						step: 0.05,
						get value() {
							return panSpeed;
						},

						set value($$value) {
							panSpeed = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'zoomSpeed',
						min: 0.1,
						max: 2,
						step: 0.1,
						get value() {
							return zoomSpeed;
						},

						set value($$value) {
							zoomSpeed = $$value;
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

		$.bind_props($$props, {
			staticMoving,
			noRotate,
			rotateSpeed,
			noZoom,
			zoomSpeed,
			noPan,
			panSpeed
		});
	});
}