import * as $ from 'svelte/internal/server';
import InstancedMesh from '../InstancedMesh.svelte';
import Self from './InnerInstancedMeshes.svelte';

export default function InnerInstancedMeshes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			meshes,
			index = meshes.length - 1,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const mesh = meshes[index];

		if (index > -1) {
			$$renderer.push('<!--[0-->');

			InstancedMesh($$renderer, $.spread_props([
				{
					geometry: mesh.geometry,
					material: mesh.material,
					id: mesh.uuid
				},
				props,
				{
					children: ($$renderer) => {
						Self($$renderer, $.spread_props([
							{ meshes, index: index - 1 },
							props,
							{
								children: ($$renderer) => {
									children?.($$renderer);
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							}
						]));
					},
					$$slots: { default: true }
				}
			]));
		} else {
			$$renderer.push('<!--[-1-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}