import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { AnimatedSpriteMaterial, Suspense } from '@threlte/extras';
import { Mesh, MeshStandardMaterial } from 'three';

var root = $.from_html(`<!> <!>`, 1);

export default function Player($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 15);
	const keyboard = { x: 0 };
	const pressed = new Set();
	let sprite = $.state(void 0);
	let animation = $.state('IdleRight');
	const mesh = new Mesh();

	mesh.position.set(...position());

	const handleKey = (key, value) => {
		switch (key.toLowerCase()) {
			case 'a':

			case 'arrowleft':
				return keyboard.x = +value;

			case 'd':

			case 'arrowright':
				return keyboard.x = -value;
		}

		return;
	};

	const handleKeydown = (e) => {
		pressed.add(e.key);
		pressed.forEach((key) => handleKey(key, 1));
	};

	const handleKeyup = (e) => {
		pressed.delete(e.key);
		handleKey(e.key, 0);
		pressed.forEach((key) => handleKey(key, 1));

		if (e.key === 'q') $.get(sprite)?.play();
		if (e.key === 'e') $.get(sprite)?.pause();
	};

	useTask((delta) => {
		if (keyboard.x > 0) {
			$.set(animation, 'RunLeft');
		} else if (keyboard.x < 0) {
			$.set(animation, 'RunRight');
		} else {
			$.set(animation, $.get(animation).replace('Run', 'Idle'), true);
		}

		if (keyboard.x === 0) return;

		position(position()[0] += -keyboard.x * (delta * 2), true);
		mesh.position.set(...position());
	});

	$.event('keydown', $.window, handleKeydown);
	$.event('keyup', $.window, handleKeyup);

	Suspense($$anchor, {
		children: ($$anchor, $$slotProps) => {
			T($$anchor, {
				get is() {
					return mesh;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => new MeshStandardMaterial());

						$.bind_this(
							AnimatedSpriteMaterial(node, {
								get is() {
									return $.get($0);
								},

								get animation() {
									return $.get(animation);
								},
								textureUrl: '/textures/sprites/player.png',
								dataUrl: '/textures/sprites/player.json'
							}),
							($$value) => $.set(sprite, $$value),
							() => $.get(sprite)
						);
					}

					var node_1 = $.sibling(node, 2);

					$.component(node_1, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
						T_PlaneGeometry($$anchor, { args: [0.5, 0.5] });
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}