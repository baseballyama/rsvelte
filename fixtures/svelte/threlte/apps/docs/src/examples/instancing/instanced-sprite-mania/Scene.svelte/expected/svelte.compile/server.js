import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { CSM, Sky, useTexture } from '@threlte/extras';
import { BackSide, NearestFilter, RepeatWrapping, MathUtils } from 'three';
import DudeSprites from './sprites/DudeSprites.svelte';
import FlyerSprites from './sprites/FlyerSprites.svelte';
import FlyerSpritesTyped from './sprites/FlyerSpritesTyped.svelte';
import GoblinSprites from './sprites/GoblinSprites.svelte';
import TreeSpriteAtlas from './sprites/TreeSpriteAtlas.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { billboarding = false, fps, children } = $$props;

		const grass = useTexture('/textures/sprites/pixel-grass.png', {
			transform: (texture) => {
				texture.wrapS = texture.wrapT = RepeatWrapping;
				texture.repeat.set(500, 500);
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

		const { renderer } = useThrelte();

		renderer.setPixelRatio(1);
		children?.($$renderer);
		$$renderer.push(`<!----> `);

		CSM($$renderer, {
			args: { mode: 'logarithmic' },
			lightDirection: [-1, -1, -1],
			lightIntensity: 5,
			children: ($$renderer) => {
				DudeSprites($$renderer, { billboarding, fps });
				$$renderer.push(`<!----> `);
				FlyerSprites($$renderer, { billboarding, fps });
				$$renderer.push(`<!----> `);
				GoblinSprites($$renderer, { billboarding, fps });
				$$renderer.push(`<!----> `);
				FlyerSpritesTyped($$renderer, { billboarding });
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
									T.SphereGeometry($$renderer, { args: [300, 8, 8] });
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
							'rotation.x': -MathUtils.DEG2RAD * 90,
							receiveShadow: true,
							children: ($$renderer) => {
								if (T.CircleGeometry) {
									$$renderer.push('<!--[-->');
									T.CircleGeometry($$renderer, { args: [300] });
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

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}