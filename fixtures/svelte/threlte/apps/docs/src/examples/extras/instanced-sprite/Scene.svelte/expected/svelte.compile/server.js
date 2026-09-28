import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Sky, useTexture } from '@threlte/extras';
import { BackSide, NearestFilter, RepeatWrapping, MathUtils } from 'three';
import TreeSpriteAtlas from './TreeSpriteAtlas.svelte';
import DudeSprites from './DudeSprites.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { billboarding = false, fps, children } = $$props;

		const grass = useTexture('/textures/sprites/pixel-grass.png', {
			transform: (texture) => {
				texture.wrapS = texture.wrapT = RepeatWrapping;
				texture.repeat.set(100, 100);
				texture.minFilter = NearestFilter;
				texture.magFilter = NearestFilter;
				texture.needsUpdate = true;

				return texture;
			}
		});

		const sky = useTexture('/textures/sprites/pixel-sky.png', {
			transform: (texture) => {
				texture.wrapS = texture.wrapT = RepeatWrapping;
				texture.repeat.set(10, 2);
				texture.minFilter = NearestFilter;
				texture.magFilter = NearestFilter;
				texture.needsUpdate = true;

				return texture;
			}
		});

		children?.($$renderer);
		$$renderer.push(`<!----> `);
		DudeSprites($$renderer, { billboarding, fps });
		$$renderer.push(`<!----> `);
		TreeSpriteAtlas($$renderer, { billboarding });
		$$renderer.push(`<!----> `);

		if ($.store_get($$store_subs ??= {}, '$sky', sky)) {
			$$renderer.push('<!--[0-->');

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					'position.y': -10,
					'scale.y': 0.5,
					children: ($$renderer) => {
						if (T.SphereGeometry) {
							$$renderer.push('<!--[-->');
							T.SphereGeometry($$renderer, { args: [110] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshBasicMaterial) {
							$$renderer.push('<!--[-->');

							T.MeshBasicMaterial($$renderer, {
								map: $.store_get($$store_subs ??= {}, '$sky', sky),
								side: BackSide
							});

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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if ($.store_get($$store_subs ??= {}, '$grass', grass)) {
			$$renderer.push('<!--[0-->');

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					'rotation.x': MathUtils.DEG2RAD * -90,
					receiveShadow: true,
					children: ($$renderer) => {
						if (T.CircleGeometry) {
							$$renderer.push('<!--[-->');
							T.CircleGeometry($$renderer, { args: [110] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshLambertMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshLambertMaterial($$renderer, { map: $.store_get($$store_subs ??= {}, '$grass', grass) });
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		Sky($$renderer, { elevation: 13.35 });
		$$renderer.push(`<!----> `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 1 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');

			T.DirectionalLight($$renderer, {
				'shadow.mapSize': [2048, 2048],
				'shadow.camera.far': 128,
				'shadow.camera.near': 0.01,
				'shadow.camera.left': -20,
				'shadow.camera.right': 20,
				'shadow.camera.top': 20,
				'shadow.camera.bottom': -20,
				'shadow.bias': -0.0001,
				'position.x': 0,
				'position.y': 50,
				'position.z': 30,
				intensity: 3,
				castShadow: true
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}