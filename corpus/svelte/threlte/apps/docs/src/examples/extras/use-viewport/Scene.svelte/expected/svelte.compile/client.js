import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Mesh } from 'three';
import { T, useTask, useThrelte } from '@threlte/core';
import { OrbitControls, useViewport, RoundedBoxGeometry } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const viewport = useViewport();
	const { renderStage, scheduler } = useThrelte();
	let mesh = new Mesh();

	const positions = [
		[1, 0.5, 3.5],
		[-1, 0.5, -3.5],
		[-1, 0.5, 3.5],
		[1, 0.5, -3.5]
	];

	useTask(
		() => {
			const { width, height, distance } = viewport.current;

			mesh.scale.set(width * 0.4, height * 0.2, distance * 0.25);
			mesh.position.y = mesh.scale.y / 2;
		},
		{
			stage: scheduler.createStage(Symbol('viewport-stage'), { before: renderStage })
		}
	);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [8, 8, 8],
			fov: 50,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					minDistance: 5,
					maxDistance: 15,
					enableDamping: true,
					autoRotate: true
				});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { castShadow: true, position: [3, 5, 3], intensity: 1.5 });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_3 = $.sibling(node_2, 2);

	T(node_3, {
		get is() {
			return mesh;
		},
		castShadow: true,
		receiveShadow: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			RoundedBoxGeometry(node_4, { radius: 0.1 });

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
				T_MeshStandardMaterial($$anchor, { color: 'turquoise' });
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	$.each(node_6, 17, () => positions, $.index, ($$anchor, position) => {
		var fragment_3 = $.comment();
		var node_7 = $.first_child(fragment_3);

		$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				castShadow: true,
				get position() {
					return $.get(position);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_8 = $.first_child(fragment_4);

					$.component(node_8, () => T.DodecahedronGeometry, ($$anchor, T_DodecahedronGeometry) => {
						T_DodecahedronGeometry($$anchor, { args: [0.5] });
					});

					var node_9 = $.sibling(node_8, 2);

					$.component(node_9, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial) => {
						T_MeshToonMaterial($$anchor, { color: '#fff' });
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_3);
	});

	var node_10 = $.sibling(node_6, 2);

	$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			'rotation.x': -Math.PI / 2,
			scale: 6,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root();
				var node_11 = $.first_child(fragment_5);

				$.component(node_11, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [1, 128] });
				});

				var node_12 = $.sibling(node_11, 2);

				$.component(node_12, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial_1) => {
					T_MeshToonMaterial_1($$anchor, { color: '#ccc' });
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}