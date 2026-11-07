import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createInstanceIdContext } from '../useInstanceId.js';
import Instance from '../Instance.svelte';
import InnerInstancedMeshes from './InnerInstancedMeshes.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'meshes', 'children']);

export default function InstancedMeshes($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);

	const getInstance = (id) => {
		return (...args) => {
			createInstanceIdContext(id);

			return Instance(...args);
		};
	};

	const getInstanceComponentsArray = (meshes) => {
		return meshes.filter((mesh) => mesh.isMesh).map((mesh) => getInstance(mesh.uuid));
	};

	const getInstanceComponentsObject = (meshes) => {
		return Object.entries(meshes).reduce(
			(acc, [id, mesh]) => {
				// filter out non-mesh objects
				if (!mesh.isMesh) return acc;

				acc[id] = getInstance(mesh.uuid);

				return acc;
			},
			{}
		);
	};

	let components = $.derived(() => Array.isArray($$props.meshes)
		? getInstanceComponentsArray($$props.meshes)
		: getInstanceComponentsObject($$props.meshes));

	let meshesArray = $.derived(() => Array.isArray($$props.meshes) ? $$props.meshes : Object.values($$props.meshes));
	let filteredMeshesArray = $.derived(() => $.get(meshesArray).filter((mesh) => mesh.isMesh));

	InnerInstancedMeshes($$anchor, $.spread_props(
		{
			get meshes() {
				return $.get(filteredMeshesArray);
			}
		},
		() => props,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ components: $.get(components) }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}