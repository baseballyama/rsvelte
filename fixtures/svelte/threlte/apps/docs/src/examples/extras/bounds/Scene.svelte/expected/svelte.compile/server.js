import * as $ from 'svelte/internal/server';
import { isInstanceOf, T, useTask } from '@threlte/core';

import {
	Bounds,
	CameraControls,
	OrbitControls,
	Sparkles,
	TrackballControls,
	useGltf,
	useSuspense,
	useTexture
} from '@threlte/extras';

import {
	Color,
	DoubleSide,
	MeshBasicMaterial,
	MeshPhongMaterial,
	ShaderMaterial,
	Uniform
} from 'three';

import vertexShader from './vertex';
import fragmentShader from './fragment';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { camera, controls, margin, animate, enabled } = $$props;
		const suspend = useSuspense();
		const gltf = suspend(useGltf('/models/portal/portal.glb'));

		const texture = suspend(useTexture('/models/portal/portal_baked.jpg', {
			transform(result) {
				result.flipY = false;

				return result;
			}
		}));

		const poleLightMaterial = new MeshBasicMaterial({ color: 0xff_ff_e5 });
		const bakedMaterial = new MeshPhongMaterial();

		const portalLightMaterial = new ShaderMaterial({
			uniforms: {
				uTime: new Uniform(0),
				uColorStart: new Uniform(new Color('#1E88E5')),
				uColorEnd: new Uniform(new Color('#5E35B1'))
			},
			side: DoubleSide,
			vertexShader,
			fragmentShader
		});

		useTask((dt) => {
			portalLightMaterial.uniforms.uTime.value += dt;
		});

		function Controls($$renderer) {
			if (controls === 'orbit') {
				$$renderer.push('<!--[0-->');
				OrbitControls($$renderer, { enableDamping: true, enableZoom: false, enablePan: false });
			} else if (controls === 'camera') {
				$$renderer.push('<!--[1-->');
				CameraControls($$renderer, {});
			} else if (controls === 'trackball') {
				$$renderer.push('<!--[2-->');
				TrackballControls($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		if (camera === 'perspective') {
			$$renderer.push('<!--[0-->');

			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					'position.x': 20,
					'position.y': 10,
					'position.z': -20,
					fov: 50,
					children: ($$renderer) => {
						Controls($$renderer);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (camera === 'orthographic') {
			$$renderer.push('<!--[1-->');

			if (T.OrthographicCamera) {
				$$renderer.push('<!--[-->');

				T.OrthographicCamera($$renderer, {
					makeDefault: true,
					'position.x': 20,
					'position.y': 10,
					'position.z': -20,
					zoom: 50,
					children: ($$renderer) => {
						Controls($$renderer);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

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
			T.AmbientLight($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if ($.store_get($$store_subs ??= {}, '$gltf', gltf)) {
			$$renderer.push('<!--[0-->');

			Bounds($$renderer, {
				margin,
				animate,
				enabled,
				children: ($$renderer) => {
					T($$renderer, {
						is: $.store_get($$store_subs ??= {}, '$gltf', gltf).scene,
						oncreate: (ref) => {
							ref.traverse((child) => {
								if (!isInstanceOf(child, 'Mesh')) {
									return;
								}

								if (child.name === 'Portal') {
									child.material = portalLightMaterial;
								} else if (child.name === 'LampLight1' || child.name === 'LampLight2') {
									child.material = poleLightMaterial;
								} else {
									child.material = bakedMaterial;
								}
							});
						},

						children: ($$renderer) => {
							Sparkles($$renderer, { position: [0, 0.8, 0], size: 4, scale: [4, 1.5, 4] });
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}