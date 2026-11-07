import * as $ from 'svelte/internal/server';
import { Group, MathUtils } from 'three';
import { T } from '@threlte/core';
import { useGltf } from '@threlte/extras';
import { Tween } from 'svelte/motion';
import { scoping } from '../Controls.svelte';

export default function Scope($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const group = new Group();
		const gltf = useGltf('/models/scope.glb');
		const rotationX = new Tween(-3);
		const position = new Tween([0.4, -0.15, -1]);

		T($$renderer, {
			is: group,
			dispose: false,
			scale: 0.02,
			position: position.current,
			'rotation.y': MathUtils.DEG2RAD * rotationX.current,
			children: ($$renderer) => {
				$.await($$renderer, gltf, () => {}, ({ nodes, materials }) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							geometry: nodes.Object_2.geometry,
							material: materials.initialShadingGroup,
							rotation: [-Math.PI / 2, 0, 0]
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				});

				$$renderer.push(`<!--]--> `);
				children?.($$renderer, { ref: group });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}