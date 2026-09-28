import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { OrbitControls, useDraco, useGltf, useTexture } from '@threlte/extras';
import { NoToneMapping } from 'three';
import Mesh from './Mesh.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const dracoLoader = useDraco();
	const gltf = useGltf('https://infinite-turtles.pages.dev/models/cards-transformed.glb', { dracoLoader });
	const texture = useTexture('https://infinite-turtles.pages.dev/images/map.png');
	const { renderer } = useThrelte();

	renderer.toneMapping = NoToneMapping;

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [3, 0, 3],
			fov: 25,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { autoRotate: true, enableDamping: true });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(node_2, () => gltf, null, ($$anchor, gltf) => {
		var fragment_2 = $.comment();
		var node_3 = $.first_child(fragment_2);

		$.await(node_3, () => texture, null, ($$anchor, texture) => {
			var fragment_3 = root();
			var node_4 = $.first_child(fragment_3);

			Mesh(node_4, {
				get geometry() {
					return $.get(gltf).nodes.Background.geometry;
				},

				get texture() {
					return $.get(texture);
				},

				get visible() {
					return $$props.settings.background;
				},

				get wireframe() {
					return $$props.settings.wireframe;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Mesh(node_5, {
				get geometry() {
					return $.get(gltf).nodes.Border.geometry;
				},

				get texture() {
					return $.get(texture);
				},

				get visible() {
					return $$props.settings.border;
				},

				get wireframe() {
					return $$props.settings.wireframe;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Mesh(node_6, {
				get geometry() {
					return $.get(gltf).nodes.Turtle.geometry;
				},

				get texture() {
					return $.get(texture);
				},

				get visible() {
					return $$props.settings.turtle;
				},

				get wireframe() {
					return $$props.settings.wireframe;
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Mesh(node_7, {
				get geometry() {
					return $.get(gltf).nodes.Player.geometry;
				},

				get texture() {
					return $.get(texture);
				},

				get visible() {
					return $$props.settings.player;
				},

				get wireframe() {
					return $$props.settings.wireframe;
				}
			});

			var node_8 = $.sibling(node_7, 2);

			Mesh(node_8, {
				get geometry() {
					return $.get(gltf).nodes.EnemyScorp.geometry;
				},

				get texture() {
					return $.get(texture);
				},

				get visible() {
					return $$props.settings.enemy;
				},

				get wireframe() {
					return $$props.settings.wireframe;
				}
			});

			var node_9 = $.sibling(node_8, 2);

			Mesh(node_9, {
				get geometry() {
					return $.get(gltf).nodes.Heart.geometry;
				},

				get texture() {
					return $.get(texture);
				},

				get visible() {
					return $$props.settings.heart;
				},

				get wireframe() {
					return $$props.settings.wireframe;
				}
			});

			var node_10 = $.sibling(node_9, 2);

			Mesh(node_10, {
				get geometry() {
					return $.get(gltf).nodes.Potion.geometry;
				},

				get texture() {
					return $.get(texture);
				},

				get visible() {
					return $$props.settings.potion;
				},

				get wireframe() {
					return $$props.settings.wireframe;
				}
			});

			var node_11 = $.sibling(node_10, 2);

			Mesh(node_11, {
				get geometry() {
					return $.get(gltf).nodes.RuneEffect.geometry;
				},

				get texture() {
					return $.get(texture);
				},

				get visible() {
					return $$props.settings.runeEffect;
				},

				get wireframe() {
					return $$props.settings.wireframe;
				}
			});

			var node_12 = $.sibling(node_11, 2);

			Mesh(node_12, {
				get geometry() {
					return $.get(gltf).nodes.RuneHost.geometry;
				},

				get texture() {
					return $.get(texture);
				},

				get visible() {
					return $$props.settings.runeHost;
				},

				get wireframe() {
					return $$props.settings.wireframe;
				}
			});

			$.append($$anchor, fragment_3);
		});

		$.append($$anchor, fragment_2);
	});

	$.append($$anchor, fragment);
	$.pop();
}