import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	OrbitControls,
	Grid,
	useGltf,
	Environment,
	Wireframe,
	bvh,
	interactivity
} from '@threlte/extras';

import { T, useTask } from '@threlte/core';
import { BufferAttribute, DynamicDrawUsage, Mesh, Vector3 } from 'three';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let rest = $.rest_props($$props, rest_excludes);
	const { raycaster } = interactivity();

	raycaster.firstHitOnly = true;
	bvh(() => rest);

	const gltf = useGltf('/models/stanford_bunny.glb');
	const mesh = $.derived(() => $gltf() ? $gltf().nodes['Object_2'] : undefined);

	$.user_effect(() => {
		if ($.get(mesh)) {
			const array = new Float32Array(3 * $.get(mesh).geometry.getAttribute('position').count).fill(1);
			const attribute = new BufferAttribute(array, 3).setUsage(DynamicDrawUsage);

			$.get(mesh).geometry.setAttribute('color', attribute);
		}
	});

	const faces = new Set();

	useTask(() => {
		const attribute = $.get(mesh)?.geometry.getAttribute('color');

		if (!attribute) {
			return;
		}

		for (const face of faces) {
			let gb = attribute.getY(face.a);

			gb += 0.01;

			if (gb >= 1) {
				gb = 1;
				faces.delete(face);
			}

			attribute.setXYZ(face.a, 1, gb, gb);
			attribute.setXYZ(face.b, 1, gb, gb);
			attribute.setXYZ(face.c, 1, gb, gb);
			attribute.needsUpdate = true;
		}
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.x': -1.3,
			'position.y': 1.8,
			'position.z': 1.8,
			fov: 50,
			oncreate: (ref) => ref.lookAt(0, 0.6, 0),
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					enableDamping: true,
					enableZoom: false,
					enablePan: false,
					target: [0, 0.6, 0]
				});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			T($$anchor, {
				get is() {
					return $gltf().nodes['Object_2'];
				},
				scale: 10,
				'rotation.x': -Math.PI / 2,
				'position.y': -0.35,
				onpointermove: ({ face }) => {
					const attribute = $.get(mesh)?.geometry.getAttribute('color');

					if (face && attribute) {
						attribute.setXYZ(face.a, 1, 0, 0);
						attribute.setXYZ(face.b, 1, 0, 0);
						attribute.setXYZ(face.c, 1, 0, 0);
						faces.add(face);
					}
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_2 = $.first_child(fragment_3);

					$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, { roughness: 0.1, metalness: 0.4, vertexColors: true });
					});

					var node_3 = $.sibling(node_2, 2);

					Wireframe(node_3, {});
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($gltf()) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node_1, 2);

	$.component(node_4, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {});
	});

	var node_5 = $.sibling(node_4, 2);

	Environment(node_5, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_6 = $.sibling(node_5, 2);

	{
		let $0 = $.derived(() => new Vector3());

		Grid(node_6, {
			sectionThickness: 1,
			infiniteGrid: true,
			cellColor: '#dddddd',
			sectionColor: '#ffffff',
			sectionSize: 1,
			cellSize: 0.5,
			type: 'circular',
			get fadeOrigin() {
				return $.get($0);
			},
			fadeDistance: 20,
			fadeStrength: 10
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}