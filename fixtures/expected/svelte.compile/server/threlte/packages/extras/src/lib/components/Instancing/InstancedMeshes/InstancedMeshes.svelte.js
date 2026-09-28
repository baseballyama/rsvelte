import * as $ from 'svelte/internal/server';
import { createInstanceIdContext } from '../useInstanceId.js';
import Instance from '../Instance.svelte';
import InnerInstancedMeshes from './InnerInstancedMeshes.svelte';

export default function InstancedMeshes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { meshes, children, $$slots, $$events, ...props } = $$props;

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

		let components = $.derived(() => Array.isArray(meshes)
			? getInstanceComponentsArray(meshes)
			: getInstanceComponentsObject(meshes));

		let meshesArray = $.derived(() => Array.isArray(meshes) ? meshes : Object.values(meshes));
		let filteredMeshesArray = $.derived(() => meshesArray().filter((mesh) => mesh.isMesh));

		InnerInstancedMeshes($$renderer, $.spread_props([
			{ meshes: filteredMeshesArray() },
			props,
			{
				children: ($$renderer) => {
					children?.($$renderer, { components: components() });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));
	});
}