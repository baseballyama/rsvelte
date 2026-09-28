import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SliceMaterial from './SliceMaterial.svelte';
import { DoubleSide, Group } from 'three/webgpu';
import { Environment, OrbitControls, useDraco, useGltf } from '@threlte/extras';
import { T, useTask, useThrelte } from '@threlte/core';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const mesh = ($$anchor, mesh = $.noop) => {
		T($$anchor, {
			get is() {
				return mesh();
			},
			castShadow: true,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.component(node, () => T.MeshPhysicalMaterial, ($$anchor, T_MeshPhysicalMaterial) => {
					T_MeshPhysicalMaterial($$anchor, { metalness, roughness, envMapIntensity, color });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	};

	const dracoLoader = useDraco();
	const gltf = useGltf('/models/gears.glb', { dracoLoader });
	const { scene } = useThrelte();

	scene.backgroundBlurriness = 0.5;

	let rotation = $.state(0);

	useTask(
		(delta) => {
			$.set(rotation, $.get(rotation) + 0.1 * delta);
		},
		{ running: () => $$props.rotate }
	);

	const metalness = 0.5;
	const roughness = 0.25;
	const envMapIntensity = 0.5;
	const color = '#858080';
	const group = new Group();
	var fragment_2 = root_2();
	var node_1 = $.first_child(fragment_2);

	Environment(node_1, {
		url: '/textures/equirectangular/hdr/aerodynamics_workshop_1k.hdr',
		isBackground: true
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.x': -5,
			'position.y': 5,
			'position.z': 12,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true });
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			castShadow: true,
			intensity: 4,
			'position.x': 6.25,
			'position.y': 3,
			'position.z': 4,
			'shadow.camera.near': 0.1,
			'shadow.camera.bottom': -8,
			'shadow.camera.far': 30,
			'shadow.camera.left': -8,
			'shadow.camera.normalBias': 0.05,
			'shadow.camera.right': 8,
			'shadow.camera.top': 8,
			'shadow.mapSize.x': 2048,
			'shadow.mapSize.y': 2048
		});
	});

	var node_4 = $.sibling(node_3, 2);

	T(node_4, {
		get is() {
			return group;
		},

		get 'rotation.y'() {
			return $.get(rotation);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_5 = $.first_child(fragment_4);

			$.await(node_5, () => gltf, null, ($$anchor, $$source) => {
				var $$value = $.derived(() => {
					var { nodes } = $.get($$source);

					return { nodes };
				});

				var nodes = $.derived(() => $.get($$value).nodes);
				var fragment_5 = root();
				var node_6 = $.first_child(fragment_5);

				mesh(node_6, () => $.get(nodes).axle);

				var node_7 = $.sibling(node_6, 2);

				mesh(node_7, () => $.get(nodes).gears);

				var node_8 = $.sibling(node_7, 2);

				T(node_8, {
					get is() {
						return $.get(nodes).outerHull;
					},
					castShadow: true,
					receiveShadow: true,
					children: ($$anchor, $$slotProps) => {
						SliceMaterial($$anchor, {
							get arcAngle() {
								return $$props.arcAngle;
							},

							get startAngle() {
								return $$props.startAngle;
							},

							get sliceColor() {
								return $$props.sliceColor;
							},
							metalness,
							roughness,
							envMapIntensity,
							color,
							get side() {
								return DoubleSide;
							}
						});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_5);
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_4, 2);

	$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.x': -4,
			'position.y': -3,
			'position.z': -4,
			oncreate: (ref) => {
				ref.lookAt(group.position);
			},
			scale: 10,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_1();
				var node_10 = $.first_child(fragment_7);

				$.component(node_10, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, {});
				});

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 0xaa_aa_aa });
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_2);
	$.pop();
}