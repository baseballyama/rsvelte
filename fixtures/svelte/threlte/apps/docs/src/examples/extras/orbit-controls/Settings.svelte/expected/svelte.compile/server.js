import * as $ from 'svelte/internal/server';
import { Checkbox, Pane, ThemeUtils, Slider } from 'svelte-tweakpane-ui';

export default function Settings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			autoRotate = void 0,
			enableDamping = void 0,
			rotateSpeed = void 0,
			zoomToCursor = void 0,
			zoomSpeed = void 0,
			minPolarAngle = void 0,
			maxPolarAngle = void 0,
			enableZoom = void 0
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				theme: ThemeUtils.presets.light,
				position: 'fixed',
				title: 'OrbitControls',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'autoRotate',
						get value() {
							return autoRotate;
						},

						set value($$value) {
							autoRotate = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'enableDamping',
						get value() {
							return enableDamping;
						},

						set value($$value) {
							enableDamping = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'enableZoom',
						get value() {
							return enableZoom;
						},

						set value($$value) {
							enableZoom = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'zoomToCursor',
						get value() {
							return zoomToCursor;
						},

						set value($$value) {
							zoomToCursor = $$value;
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

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'minPolarAngle',
						min: 0,
						max: Math.PI,
						step: 0.1,
						get value() {
							return minPolarAngle;
						},

						set value($$value) {
							minPolarAngle = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'maxPolarAngle',
						min: 0,
						max: Math.PI,
						step: 0.1,
						get value() {
							return maxPolarAngle;
						},

						set value($$value) {
							maxPolarAngle = $$value;
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
			autoRotate,
			enableDamping,
			rotateSpeed,
			zoomToCursor,
			zoomSpeed,
			minPolarAngle,
			maxPolarAngle,
			enableZoom
		});
	});
}