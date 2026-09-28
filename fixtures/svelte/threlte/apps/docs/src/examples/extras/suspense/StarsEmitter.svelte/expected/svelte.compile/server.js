import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { InstancedMesh } from '@threlte/extras';
import Star from './Star.svelte';

export default function StarsEmitter($$renderer) {
	InstancedMesh($$renderer, {
		children: ($$renderer) => {
			if (T.BoxGeometry) {
				$$renderer.push('<!--[-->');
				T.BoxGeometry($$renderer, { args: [0.04, 0.04, 30] });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.MeshBasicMaterial) {
				$$renderer.push('<!--[-->');
				T.MeshBasicMaterial($$renderer, { color: 'white', transparent: true, opacity: 0.2 });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <!--[-->`);

			const each_array = $.ensure_array_like({ length: 40 });

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				Star($$renderer, {});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}