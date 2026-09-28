import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Portal } from '@threlte/extras';
import { Group, PerspectiveCamera, Vector3 } from 'three';

export default function FollowCamera($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const vector3 = new Vector3();
		let initial = false;
		let group = new Group();
		let camera = new PerspectiveCamera();

		useTask(() => {
			group.getWorldPosition(vector3);
			vector3.z = camera.position.z;

			if (!initial) {
				initial = true;
				camera.position.copy(vector3);
			} else {
				camera.position.lerp(vector3, 0.05);
			}
		});

		T($$renderer, { is: group });
		$$renderer.push(`<!----> `);

		Portal($$renderer, {
			id: 'scene',
			children: ($$renderer) => {
				T($$renderer, { is: camera, makeDefault: true, position: [0, 0, 10] });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}