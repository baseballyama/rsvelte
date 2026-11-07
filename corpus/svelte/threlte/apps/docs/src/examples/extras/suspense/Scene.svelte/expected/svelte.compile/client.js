import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { Suspense, Text } from '@threlte/extras';
import Spaceship from './Spaceship.svelte';
import StarsEmitter from './StarsEmitter.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { size } = useThrelte();
	let zoom = $.derived(() => $size().width / 50);
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
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [5, 10, 3], intensity: 2.5 });
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const fallback = ($$anchor) => {
			Text($$anchor, {
				'position.z': -8,
				text: 'Loading...',
				fontSize: 1,
				color: 'white',
				anchorX: '50%',
				anchorY: '50%',
				oncreate: (ref) => {
					ref.lookAt(-40, 25, 40);
				}
			});
		};

		const error = ($$anchor, $$arg0) => {
			let errors = () => ($$arg0?.()).errors;

			{
				let $0 = $.derived(() => errors().map((e) => e).join(', '));

				Text($$anchor, {
					'position.z': -8,
					get text() {
						return $.get($0);
					},
					fontSize: 1,
					color: 'white',
					anchorX: '50%',
					anchorY: '50%',
					oncreate: (ref) => {
						ref.lookAt(-40, 25, 40);
					}
				});
			}
		};

		Suspense(node_2, {
			final: true,
			fallback,
			error,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_3 = $.first_child(fragment_3);

				StarsEmitter(node_3, {});

				var node_4 = $.sibling(node_3, 2);

				Spaceship(node_4, { name: 'Bob', position: [-12, 0, 3] });

				var node_5 = $.sibling(node_4, 2);

				Spaceship(node_5, { name: 'Challenger', position: [10, 5, 6] });

				var node_6 = $.sibling(node_5, 2);

				Spaceship(node_6, { name: 'Dispatcher', position: [8, 3, -23] });

				var node_7 = $.sibling(node_6, 2);

				Spaceship(node_7, { name: 'Executioner', position: [12, -4, 6] });

				var node_8 = $.sibling(node_7, 2);

				Spaceship(node_8, { name: 'Imperial', position: [-1, 0, -21] });

				var node_9 = $.sibling(node_8, 2);

				Spaceship(node_9, { name: 'Insurgent', position: [-13, 1, -21] });

				var node_10 = $.sibling(node_9, 2);

				Spaceship(node_10, { name: 'Omen', position: [-9, -5, 13] });

				var node_11 = $.sibling(node_10, 2);

				Spaceship(node_11, { name: 'Pancake', position: [-9, -3, -9] });

				var node_12 = $.sibling(node_11, 2);

				Spaceship(node_12, { name: 'Spitfire', position: [1, 0, 1] });

				var node_13 = $.sibling(node_12, 2);

				Spaceship(node_13, { name: 'Striker', position: [8, -1, -10] });

				var node_14 = $.sibling(node_13, 2);

				Spaceship(node_14, { name: 'Zenith', position: [-1, 0, 13] });
				$.append($$anchor, fragment_3);
			},
			$$slots: { fallback: true, error: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}