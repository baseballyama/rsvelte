import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import { Grid, OrbitControls } from '@threlte/extras';
import { SphereGeometry } from 'three';
import { T, useThrelte } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let exposure = $.prop($$props, 'exposure', 3, 1);
	const { renderer, invalidate } = useThrelte();

	$.user_effect(() => {
		renderer.toneMappingExposure = exposure();
		invalidate();
	});

	const sphereGeo = new SphereGeometry(2.5, 32, 32);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [0, 7, 18],
			fov: 60,
			near: 1,
			far: 20000,
			makeDefault: true,
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => 85 * DEG2RAD);

					OrbitControls($$anchor, {
						get maxPolarAngle() {
							return $.get($0);
						},
						enableDamping: true,
						target: [0, 2.5, 0]
					});
				}
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			castShadow: true,
			'position.x': 3,
			'position.y': 2.5,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				T(node_2, {
					get is() {
						return sphereGeo;
					}
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { roughness: 0.1, metalness: 1 });
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_1, 2);

	$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			castShadow: true,
			'position.x': -3,
			'position.y': 2.5,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_5 = $.first_child(fragment_3);

				T(node_5, {
					get is() {
						return sphereGeo;
					}
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
					T_MeshStandardMaterial_1($$anchor, {});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node_4, 2);

	Grid(node_7, { cellColor: 'white', sectionColor: 'white' });
	$.append($$anchor, fragment);
	$.pop();
}