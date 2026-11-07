import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Environment, useGltf } from '@threlte/extras';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let rotation = $.state(0);

	useTask((delta) => {
		const f = 1 / 60 / delta; // ~1 at 60fps

		$.set(rotation, $.get(rotation) + 0.005 * f);
	});

	const gltf = useGltf('/models/helmet/DamagedHelmet.gltf');
	var fragment = root();
	var node = $.first_child(fragment);

	Environment(node, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, 'position.z': 10, fov: 20 });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { 'position.y': 10, 'position.z': 10 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get 'rotation.y'() {
				return $.get(rotation);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_4 = $.first_child(fragment_1);

				$.await(node_4, () => gltf, ($$anchor) => {}, ($$anchor, value) => {
					T($$anchor, {
						get is() {
							return $.get(value).nodes['node_damagedHelmet_-6514'];
						}
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}