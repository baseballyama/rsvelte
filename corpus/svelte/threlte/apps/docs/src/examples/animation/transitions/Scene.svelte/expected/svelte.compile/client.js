import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import Character from './Character.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [-0.85, 1.75, 2.46],
			oncreate: (ref) => {
				ref.lookAt(0, 1, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [10, 5, 5], castShadow: true });
	});

	var node_3 = $.sibling(node_2, 2);

	Character(node_3, {
		get actionKey() {
			return $$props.action;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => MathUtils.degToRad(-90));

		$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				get 'rotation.x'() {
					return $.get($0);
				},
				receiveShadow: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_5 = $.first_child(fragment_1);

					$.component(node_5, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
						T_CircleGeometry($$anchor, { args: [3, 72] });
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, { color: 'white' });
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}