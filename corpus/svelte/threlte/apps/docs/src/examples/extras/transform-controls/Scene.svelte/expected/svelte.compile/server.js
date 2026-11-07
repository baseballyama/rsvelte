import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

import {
	CameraControls,
	OrbitControls,
	TrackballControls,
	TransformControls
} from '@threlte/extras';

import { PerspectiveCamera } from 'three';

export default function Scene($$renderer, $$props) {
	let { controls = '<OrbitControls>', autoPauseControls = true } = $$props;
	let camera = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<!---->`);

		{
			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					position: [10, 5, 10],
					get ref() {
						return camera;
					},

					set ref($$value) {
						camera = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (controls === '<TrackballControls>') {
							$$renderer.push('<!--[0-->');
							TrackballControls($$renderer, {});
						} else if (controls === '<OrbitControls>') {
							$$renderer.push('<!--[1-->');
							OrbitControls($$renderer, {});
						} else if (controls === '<CameraControls>') {
							$$renderer.push('<!--[2-->');
							CameraControls($$renderer, {});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!----> `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { 'position.y': 10, 'position.z': 10 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.3 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.GridHelper) {
			$$renderer.push('<!--[-->');
			T.GridHelper($$renderer, { args: [10, 10] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		TransformControls($$renderer, {
			autoPauseControls,
			translationSnap: 1,
			'position.y': 1,
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						children: ($$renderer) => {
							if (T.BoxGeometry) {
								$$renderer.push('<!--[-->');
								T.BoxGeometry($$renderer, { args: [2, 2, 2] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshStandardMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshStandardMaterial($$renderer, {});
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
}