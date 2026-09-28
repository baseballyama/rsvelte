import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { OrbitControls, useGltf, bvh, interactivity, PointsMaterial } from '@threlte/extras';
import { T, useTask } from '@threlte/core';
import { BufferAttribute, DynamicDrawUsage, Points } from 'three';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let rest = $.rest_props($$props, rest_excludes);
	const { raycaster } = interactivity();

	raycaster.params.Points.threshold = 0.5;

	$.user_effect(() => {
		raycaster.firstHitOnly = rest.firstHitOnly;
	});

	bvh(() => rest);

	const gltf = useGltf('/models/stairs.glb');

	const points = $.derived(() => {
		if (!$gltf()) {
			return;
		}

		const results = $gltf().nodes['Object'];
		const array = new Float32Array(3 * results.geometry.getAttribute('position').count).fill(1);
		const attribute = new BufferAttribute(array, 3).setUsage(DynamicDrawUsage);

		results.geometry.setAttribute('color', attribute);

		return results;
	});

	useTask(() => {
		if (!$.get(points)) return;

		const attribute = $.get(points).geometry.getAttribute('color');
		const indices = $.get(points).userData.indices;

		if (indices.size > 0) {
			for (const index of indices) {
				let gb = attribute.getY(index);

				gb += 0.005;

				if (gb >= 1) {
					gb = 1;
					indices.delete(index);
				}

				attribute.setXYZ(index, 1, gb, gb);
			}

			attribute.needsUpdate = true;
		}
	});

	let visible = $.state(false);
	let point = $.state([0, 0, 0]);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.x': 20,
			'position.y': 20,
			'position.z': -20,
			fov: 50,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false, enablePan: false });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			T($$anchor, {
				get is() {
					return $.get(points);
				},
				'rotation.x': -Math.PI / 2,
				'userData.indices': new Set(),
				onpointerenter: () => {
					$.set(visible, true);
				},

				onpointerleave: () => {
					$.set(visible, false);
				},

				onpointermove: (event) => {
					$.set(point, event.point.toArray());

					if (event.index) {
						$.get(points).geometry.getAttribute('color').setXYZ(event.index, 1, 0, 0);
						$.get(points).userData.indices.add(event.index);
					}
				},

				children: ($$anchor, $$slotProps) => {
					PointsMaterial($$anchor, {
						size: 0.2,
						vertexColors: true,
						transparent: true,
						toneMapped: false,
						opacity: 0.75
					});
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(points)) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get position() {
				return $.get(point);
			},
			renderOrder: 1,
			get visible() {
				return $.get(visible);
			},
			bvh: { enabled: false },
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_3 = $.first_child(fragment_4);

				$.component(node_3, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, { args: [0.5] });
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, {
						color: 'red',
						depthTest: false,
						transparent: true,
						opacity: 0.5
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node_2, 2);

	$.component(node_5, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}