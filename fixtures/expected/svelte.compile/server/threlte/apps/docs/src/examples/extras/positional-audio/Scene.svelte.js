import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { AudioListener, Environment, interactivity, OrbitControls } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { MathUtils } from 'three';
import Speaker from './Speaker.svelte';
import Turntable from './Turntable.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let volume = 0;
		let isPlaying = false;
		const smoothVolume = new Spring(0);
		const { size } = useThrelte();
		let zoom = $.derived(() => $.store_get($$store_subs ??= {}, '$size', size).width / 18);

		interactivity({
			filter: (hits) => {
				// only return first hit, we don't care
				// about propagation in this example
				return hits.slice(0, 1);
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Environment($$renderer, {
				url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
			});

			$$renderer.push(`<!----> `);

			if (T.OrthographicCamera) {
				$$renderer.push('<!--[-->');

				T.OrthographicCamera($$renderer, {
					zoom: zoom(),
					makeDefault: true,
					position: [6, 9, 9],
					oncreate: (ref) => {
						ref.lookAt(0, 1.5, 0);
					},

					children: ($$renderer) => {
						OrbitControls($$renderer, {
							autoRotate: isPlaying,
							autoRotateSpeed: 0.5,
							enableDamping: true,
							maxPolarAngle: MathUtils.DEG2RAD * 80,
							'target.y': 1.5
						});

						$$renderer.push(`<!----> `);
						AudioListener($$renderer, {});
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

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					receiveShadow: true,
					'rotation.x': MathUtils.DEG2RAD * -90,
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

			Turntable($$renderer, {
				get isPlaying() {
					return isPlaying;
				},

				set isPlaying($$value) {
					isPlaying = $$value;
					$$settled = false;
				},

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

			$$renderer.push(`<!----> `);

			if (T.DirectionalLight) {
				$$renderer.push('<!--[-->');

				T.DirectionalLight($$renderer, {
					castShadow: true,
					'shadow.camera.left': -10,
					'shadow.camera.bottom': -10,
					'shadow.camera.right': 10,
					'shadow.camera.top': 10,
					position: [10, 20, 8],
					intensity: 0.3
				});

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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}