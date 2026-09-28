import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Button, Checkbox, Pane, Separator } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';
import { MathUtils } from 'three';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let controls = void 0;
		let mesh = void 0;

		/**
		 * controls.enabled can not be bound to since its not reactive
		 */
		let enabled = true;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				title: 'Camera Controls',
				position: 'fixed',
				children: ($$renderer) => {
					Button($$renderer, { title: 'rotate(45deg, 0)' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'rotate(-90deg, 0)' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'rotate(360deg, 0)' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'rotate(0, 20deg)' });
					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'truck(1, 0)' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'truck(0, 1)' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'truck(-1, -1)' });
					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'dolly(1)' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'dolly(-1)' });
					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'zoom(camera.zoom / 2)' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'zoom(-camera.zoom / 2)' });
					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'moveTo(3, 5, 2)' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'fitToBox(mesh)' });
					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'setPosition(-5, 2, 1)' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'setTarget(3, 0, -3)' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'setLookAt(1, 2, 3, 1, 1, 0)' });
					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'lerpLookAt(-2,0,0,1,1,0,0,2,5,-1,0,0,random())' });
					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'reset()' });
					$$renderer.push(`<!----> `);
					Button($$renderer, { title: 'saveState()' });
					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
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

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Canvas($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, {
						get controls() {
							return controls;
						},

						set controls($$value) {
							controls = $$value;
							$$settled = false;
						},

						get mesh() {
							return mesh;
						},

						set mesh($$value) {
							mesh = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}