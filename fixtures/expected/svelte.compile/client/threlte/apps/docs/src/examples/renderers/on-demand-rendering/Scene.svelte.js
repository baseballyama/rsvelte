import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Grid, OrbitControls, interactivity } from '@threlte/extras';
import { Spring } from 'svelte/motion';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	const scale = new Spring(1);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [10, 10, 10],
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [3, 10, 7], intensity: Math.PI });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.3 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get scale() {
				return scale.current;
			},
			onpointerenter: () => scale.set(1.5),
			onpointerleave: () => scale.set(1),
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						'position.y': 1,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
								T_SphereGeometry($$anchor, { args: [1] });
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
								T_MeshStandardMaterial($$anchor, { color: '#FE3D00', toneMapped: false });
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node_3, 2);

	Grid(node_7, { cellColor: '#FE3D00', sectionColor: '#FE3D00' });
	$.append($$anchor, fragment);
	$.pop();
}