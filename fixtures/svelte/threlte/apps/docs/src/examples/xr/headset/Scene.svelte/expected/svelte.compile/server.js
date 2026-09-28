import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

import {
	Controller,
	Hand,
	Headset,
	XR,
	pointerControls,
	teleportControls
} from '@threlte/xr';

import { AudioListener, interactivity } from '@threlte/extras';
import { MathUtils } from 'three';
import Turntable from '../../extras/positional-audio/Turntable.svelte';
import Speaker from '../../extras/positional-audio/Speaker.svelte';
import Microphone from './Microphone.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let volume = 0;

		interactivity();
		pointerControls('left');
		pointerControls('right');
		teleportControls('left');
		teleportControls('right');

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			XR($$renderer, {
				children: ($$renderer) => {
					Headset($$renderer, {
						children: ($$renderer) => {
							Microphone($$renderer, { position: [-0.1, -0.05, -0.1], 'rotation.x': Math.PI / 3 });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Controller($$renderer, { left: true });
					$$renderer.push(`<!----> `);
					Controller($$renderer, { right: true });
					$$renderer.push(`<!----> `);
					Hand($$renderer, { left: true });
					$$renderer.push(`<!----> `);
					Hand($$renderer, { right: true });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Headset($$renderer, {
				children: ($$renderer) => {
					AudioListener($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					teleportSurface: true,
					receiveShadow: true,
					'rotation.x': -Math.PI / 2,
					children: ($$renderer) => {
						if (T.CircleGeometry) {
							$$renderer.push('<!--[-->');
							T.CircleGeometry($$renderer, { args: [10, 64] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { color: '#333333' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [0, 0.6, -0.5],
					scale: 0.08,
					children: ($$renderer) => {
						Turntable($$renderer, {
							get volume() {
								return volume;
							},

							set volume($$value) {
								volume = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Speaker($$renderer, {
							'position.x': 6,
							'rotation.y': MathUtils.DEG2RAD * -7,
							volume
						});

						$$renderer.push(`<!----> `);

						Speaker($$renderer, {
							'position.x': -6,
							'rotation.y': MathUtils.DEG2RAD * 7,
							volume
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');
				T.PerspectiveCamera($$renderer, { makeDefault: true, near: 0.001, position: [0, 1, 2] });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.AmbientLight) {
				$$renderer.push('<!--[-->');
				T.AmbientLight($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.DirectionalLight) {
				$$renderer.push('<!--[-->');
				T.DirectionalLight($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}