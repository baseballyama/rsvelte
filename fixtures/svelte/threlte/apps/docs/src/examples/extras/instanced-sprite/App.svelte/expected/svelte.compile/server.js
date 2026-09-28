import * as $ from 'svelte/internal/server';
import { Canvas, T } from '@threlte/core';
import Scene from './Scene.svelte';
import Settings from './Settings.svelte';
import { OrbitControls } from '@threlte/extras';

export default function App($$renderer) {
	let billboarding = false;
	let fps = 10;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="svelte-1s8z6kx">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				if (T.PerspectiveCamera) {
					$$renderer.push('<!--[-->');

					T.PerspectiveCamera($$renderer, {
						makeDefault: true,
						'position.z': 14,
						'position.y': 6,
						children: ($$renderer) => {
							OrbitControls($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);
				Scene($$renderer, { billboarding, fps });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Settings($$renderer, {
			get billboarding() {
				return billboarding;
			},

			set billboarding($$value) {
				billboarding = $$value;
				$$settled = false;
			},

			get fps() {
				return fps;
			},

			set fps($$value) {
				fps = $$value;
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
}