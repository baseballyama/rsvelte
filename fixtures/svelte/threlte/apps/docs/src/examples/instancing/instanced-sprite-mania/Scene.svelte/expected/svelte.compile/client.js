import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { CSM, Sky, useTexture } from '@threlte/extras';
import { BackSide, NearestFilter, RepeatWrapping, MathUtils } from 'three';
import DudeSprites from './sprites/DudeSprites.svelte';
import FlyerSprites from './sprites/FlyerSprites.svelte';
import FlyerSpritesTyped from './sprites/FlyerSpritesTyped.svelte';
import GoblinSprites from './sprites/GoblinSprites.svelte';
import TreeSpriteAtlas from './sprites/TreeSpriteAtlas.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $sky = () => $.store_get(sky, '$sky', $$stores);
	const $grass = () => $.store_get(grass, '$grass', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let billboarding = $.prop($$props, 'billboarding', 3, false);

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

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	CSM(node_1, {
		args: { mode: 'logarithmic' },
		lightDirection: [-1, -1, -1],
		lightIntensity: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			DudeSprites(node_2, {
				get billboarding() {
					return billboarding();
				},

				get fps() {
					return $$props.fps;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			FlyerSprites(node_3, {
				get billboarding() {
					return billboarding();
				},

				get fps() {
					return $$props.fps;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			GoblinSprites(node_4, {
				get billboarding() {
					return billboarding();
				},

				get fps() {
					return $$props.fps;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			FlyerSpritesTyped(node_5, {
				get billboarding() {
					return billboarding();
				}
			});

			var node_6 = $.sibling(node_5, 2);

			TreeSpriteAtlas(node_6, {
				get billboarding() {
					return billboarding();
				}
			});

			var node_7 = $.sibling(node_6, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_8 = $.first_child(fragment_2);

					$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							'position.y': -10,
							'scale.y': 0.5,
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_9 = $.first_child(fragment_3);

								$.component(node_9, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
									T_SphereGeometry($$anchor, { args: [300, 8, 8] });
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
									T_MeshBasicMaterial($$anchor, {
										get map() {
											return $sky();
										},

										get side() {
											return BackSide;
										}
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_7, ($$render) => {
					if ($sky()) $$render(consequent);
				});
			}

			var node_11 = $.sibling(node_7, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_12 = $.first_child(fragment_4);

					{
						let $0 = $.derived(() => -MathUtils.DEG2RAD * 90);

						$.component(node_12, () => T.Mesh, ($$anchor, T_Mesh_1) => {
							T_Mesh_1($$anchor, {
								get 'rotation.x'() {
									return $.get($0);
								},
								receiveShadow: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_13 = $.first_child(fragment_5);

									$.component(node_13, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
										T_CircleGeometry($$anchor, { args: [300] });
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => T.MeshLambertMaterial, ($$anchor, T_MeshLambertMaterial) => {
										T_MeshLambertMaterial($$anchor, {
											get map() {
												return $grass();
											}
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_4);
				};

				$.if(node_11, ($$render) => {
					if ($grass()) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_1, 2);

	Sky(node_15, { elevation: 13.35 });

	var node_16 = $.sibling(node_15, 2);

	$.component(node_16, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 1 });
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}