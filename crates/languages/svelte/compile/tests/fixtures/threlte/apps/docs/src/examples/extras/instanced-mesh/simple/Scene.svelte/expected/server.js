import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Instance, InstancedMesh } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dn = Date.now();

		useTask(() => dn = Date.now());

		InstancedMesh($$renderer, {
			children: ($$renderer) => {
				if (T.SphereGeometry) {
					$$renderer.push('<!--[-->');
					T.SphereGeometry($$renderer, { args: [0.5] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshStandardMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshStandardMaterial($$renderer, { color: 'white' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);
				Instance($$renderer, { 'position.x': -2, 'position.y': Math.sin(dn / 1000 + 40) });
				$$renderer.push(`<!----> `);
				Instance($$renderer, { 'position.x': -1, 'position.y': Math.sin(dn / 1000 + 10) });
				$$renderer.push(`<!----> `);
				Instance($$renderer, { 'position.x': 0, 'position.y': Math.sin(dn / 1000 + 5) });
				$$renderer.push(`<!----> `);
				Instance($$renderer, { 'position.x': 1, 'position.y': Math.sin(dn / 1000 + 200) });
				$$renderer.push(`<!----> `);
				Instance($$renderer, { 'position.x': 2, 'position.y': Math.sin(dn / 1000 + 550) });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { 'position.y': 10, 'position.z': 5 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.1 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}