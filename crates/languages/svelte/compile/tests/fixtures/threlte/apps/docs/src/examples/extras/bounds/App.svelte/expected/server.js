import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Checkbox, List, Button, Wheel } from 'svelte-tweakpane-ui';
import { Suspense } from '@threlte/extras';

export default function App($$renderer) {
	let camera = 'perspective';
	let controls = 'orbit';
	let animate = true;
	let margin = 1.5;
	let enabled = true;
	let version = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: '',
			position: 'fixed',
			children: ($$renderer) => {
				List($$renderer, {
					label: 'camera',
					options: {
						OrthographicCamera: 'orthographic',
						PerspectiveCamera: 'perspective'
					},

					get value() {
						return camera;
					},

					set value($$value) {
						camera = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				List($$renderer, {
					label: 'controls',
					options: {
						OrbitControls: 'orbit',
						CameraControls: 'camera',
						TrackballControls: 'trackball',
						None: 'none'
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

				Wheel($$renderer, {
					label: 'margin',
					step: 0.1,
					get value() {
						return margin;
					},

					set value($$value) {
						margin = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'animate',
					get value() {
						return animate;
					},

					set value($$value) {
						animate = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'enabled',
					get value() {
						return enabled;
					},

					set value($$value) {
						enabled = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);
				Button($$renderer, { title: 'Reset scene' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="svelte-1yivz1x"><!---->`);

		{
			Canvas($$renderer, {
				children: ($$renderer) => {
					Suspense($$renderer, {
						children: ($$renderer) => {
							Scene($$renderer, { camera, controls, margin, animate, enabled });
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}