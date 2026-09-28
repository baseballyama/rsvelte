import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Spaceship from './Spaceship.svelte';
import { BakeShadows, OrbitControls, Suspense } from '@threlte/extras';
import { Color } from 'three';
import { T, useThrelte } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { size, scene } = useThrelte();

	scene.background = new Color('black');

	let zoom = $.derived(() => $size().width / 50);

	const ships = [
		{ name: 'Bob', position: [-12, 0, 3] },
		{ name: 'Challenger', position: [10, 5, 6] },
		{ name: 'Dispatcher', position: [8, 3, -23] },
		{ name: 'Executioner', position: [12, -4, 6] },
		{ name: 'Imperial', position: [-1, 0, -21] },
		{ name: 'Insurgent', position: [-13, 1, -21] },
		{ name: 'Omen', position: [-9, -5, 13] },
		{ name: 'Pancake', position: [-9, -3, -9] },
		{ name: 'Spitfire', position: [1, 0, 1] },
		{ name: 'Striker', position: [8, -1, -10] },
		{ name: 'Zenith', position: [-1, 0, 13] }
	];

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			position: [-40, 25, 40],
			makeDefault: true,
			get zoom() {
				return $.get(zoom);
			},

			oncreate: (ref) => {
				ref.lookAt(0, 0, -8);
			},

			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, target: [0, 0, -8] });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.SpotLight, ($$anchor, T_SpotLight) => {
		T_SpotLight($$anchor, {
			position: [0, 25, 0],
			castShadow: true,
			'shadow.bias': -0.0001,
			'shadow.mapSize.width': 2 ** 11,
			'shadow.mapSize.height': 2 ** 11,
			intensity: 1000,
			angle: Math.PI / 3
		});
	});

	var node_2 = $.sibling(node_1, 2);

	Suspense(node_2, {
		final: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_3 = $.first_child(fragment_2);

			$.each(node_3, 17, () => ships, ({ name, position }) => name, ($$anchor, $$item) => {
				let name = () => $.get($$item).name;
				let position = () => $.get($$item).position;

				Spaceship($$anchor, {
					get name() {
						return name();
					},

					get position() {
						return position();
					}
				});
			});

			var node_4 = $.sibling(node_3, 2);

			BakeShadows(node_4, {});
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_2, 2);

	$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			receiveShadow: true,
			'position.y': -10,
			'rotation.x': -1 * 0.5 * Math.PI,
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_6 = $.first_child(fragment_4);

				$.component(node_6, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [100] });
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'white' });
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}