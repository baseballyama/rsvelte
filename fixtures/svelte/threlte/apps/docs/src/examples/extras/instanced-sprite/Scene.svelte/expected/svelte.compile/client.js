import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Sky, useTexture } from '@threlte/extras';
import { BackSide, NearestFilter, RepeatWrapping, MathUtils } from 'three';
import TreeSpriteAtlas from './TreeSpriteAtlas.svelte';
import DudeSprites from './DudeSprites.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $sky = () => $.store_get(sky, '$sky', $$stores);
	const $grass = () => $.store_get(grass, '$grass', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let billboarding = $.prop($$props, 'billboarding', 3, false);

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

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	DudeSprites(node_1, {
		get billboarding() {
			return billboarding();
		},

		get fps() {
			return $$props.fps;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	TreeSpriteAtlas(node_2, {
		get billboarding() {
			return billboarding();
		}
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_4 = $.first_child(fragment_1);

			$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					'position.y': -10,
					'scale.y': 0.5,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_5 = $.first_child(fragment_2);

						$.component(node_5, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
							T_SphereGeometry($$anchor, { args: [110] });
						});

						var node_6 = $.sibling(node_5, 2);

						$.component(node_6, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
							T_MeshBasicMaterial($$anchor, {
								get map() {
									return $sky();
								},

								get side() {
									return BackSide;
								}
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_3, ($$render) => {
			if ($sky()) $$render(consequent);
		});
	}

	var node_7 = $.sibling(node_3, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_8 = $.first_child(fragment_3);

			{
				let $0 = $.derived(() => MathUtils.DEG2RAD * -90);

				$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						get 'rotation.x'() {
							return $.get($0);
						},
						receiveShadow: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_9 = $.first_child(fragment_4);

							$.component(node_9, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
								T_CircleGeometry($$anchor, { args: [110] });
							});

							var node_10 = $.sibling(node_9, 2);

							$.component(node_10, () => T.MeshLambertMaterial, ($$anchor, T_MeshLambertMaterial) => {
								T_MeshLambertMaterial($$anchor, {
									get map() {
										return $grass();
									}
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node_7, ($$render) => {
			if ($grass()) $$render(consequent_1);
		});
	}

	var node_11 = $.sibling(node_7, 2);

	Sky(node_11, { elevation: 13.35 });

	var node_12 = $.sibling(node_11, 2);

	$.component(node_12, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 1 });
	});

	var node_13 = $.sibling(node_12, 2);

	$.component(node_13, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
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
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}