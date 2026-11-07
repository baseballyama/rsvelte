import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { AnimatedSpriteMaterial, Suspense, useTexture } from '@threlte/extras';
import Fire from './Fire.svelte';
import Player from './Player.svelte';
import ThrelteLogo from './ThrelteLogo.svelte';
import { Tween } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const texture = useTexture('/textures/sprites/bg.png');
	let playerPosition = $.state($.proxy([-2.0, -2.75, 0.01]));
	let playerAtFire = $.derived(() => Math.abs($.get(playerPosition)[0]) < 0.7);
	const fov = Tween.of(() => $.get(playerAtFire) ? 45 : 50, { easing: cubicOut, duration: 900 });
	const cameraPosY = Tween.of(() => $.get(playerAtFire) ? -0.9 : -0.2, { easing: cubicOut, duration: 900 });
	var fragment = root();
	var node = $.first_child(fragment);

	Suspense(node, {
		children: ($$anchor, $$slotProps) => {
			Fire($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { color: '#6697C7', intensity: 0.3 });
	});

	var node_2 = $.sibling(node_1, 2);

	Suspense(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.each(node_3, 16, () => ({ length: 9 }), $.index, ($$anchor, $$item, index) => {
				var fragment_3 = $.comment();
				var node_4 = $.first_child(fragment_3);

				{
					let $0 = $.derived(() => index < 5
						? index / 2.4 + Math.random() * 0.4 - 2.8
						: index / 2.4 + Math.random() * 0.4 - 1);

					$.component(node_4, () => T.Sprite, ($$anchor, T_Sprite) => {
						T_Sprite($$anchor, {
							scale: 0.5,
							'position.y': -1.99,
							get 'position.x'() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								AnimatedSpriteMaterial($$anchor, {
									textureUrl: '/textures/sprites/grass.png',
									totalFrames: 6,
									fps: 5,
									delay: index * 40
								});
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_2, 2);

	$.await(node_5, () => texture, null, ($$anchor, map) => {
		var fragment_5 = $.comment();
		var node_6 = $.first_child(fragment_5);

		$.component(node_6, () => T.Sprite, ($$anchor, T_Sprite_1) => {
			T_Sprite_1($$anchor, {
				scale: 7.5,
				'position.z': -0.01,
				'position.y': 0.4,
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = $.comment();
					var node_7 = $.first_child(fragment_6);

					$.component(node_7, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
						T_MeshBasicMaterial($$anchor, {
							get map() {
								return $.get(map);
							}
						});
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_5);
	});

	var node_8 = $.sibling(node_5, 2);

	Suspense(node_8, {
		children: ($$anchor, $$slotProps) => {
			ThrelteLogo($$anchor, {
				get show() {
					return $.get(playerAtFire);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Player(node_9, {
		get position() {
			return $.get(playerPosition);
		},

		set position($$value) {
			$.set(playerPosition, $$value, true);
		}
	});

	var node_10 = $.sibling(node_9, 2);

	$.component(node_10, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.z': 7,
			get 'position.y'() {
				return cameraPosY.current;
			},

			get fov() {
				return fov.current;
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}