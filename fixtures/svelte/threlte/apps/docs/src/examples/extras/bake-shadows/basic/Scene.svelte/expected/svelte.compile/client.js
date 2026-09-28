import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Mesh } from 'three';
import { BakeShadows } from '@threlte/extras';
import { T, useTask } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const mesh = new Mesh();

	useTask((delta) => {
		mesh.rotation.y += delta;
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [10, 10, 10],
			oncreate: (ref) => {
				ref.lookAt(0, 1, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [0, 10, 10], castShadow: true });
	});

	var node_2 = $.sibling(node_1, 2);

	T(node_2, {
		get is() {
			return mesh;
		},
		castShadow: true,
		'position.y': 1,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
				T_BoxGeometry($$anchor, { args: [1, 2, 1] });
			});

			var node_4 = $.sibling(node_3, 2);

			$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
				T_MeshStandardMaterial($$anchor, { color: 'orangered' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_2, 2);

	$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			receiveShadow: true,
			'rotation.x': -1 * 0.5 * Math.PI,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_6 = $.first_child(fragment_2);

				$.component(node_6, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [4, 40] });
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
					T_MeshStandardMaterial_1($$anchor, { color: 'white' });
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_5, 2);

	{
		var consequent = ($$anchor) => {
			BakeShadows($$anchor, {});
		};

		$.if(node_8, ($$render) => {
			if ($$props.bake) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}