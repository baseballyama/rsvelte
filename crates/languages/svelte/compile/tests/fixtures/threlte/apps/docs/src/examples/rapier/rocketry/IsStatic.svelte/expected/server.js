import * as $ from 'svelte/internal/server';
import { useTask } from '@threlte/core';
import { useRapier } from '@threlte/rapier';
import { Vector3 } from 'three';

export default function IsStatic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { rigidBody, angularMax, linearMax, onstatic } = $$props;
		const rapier = useRapier();
		const vector3 = new Vector3();

		const isStatic = (v, max) => {
			vector3.set(v.x, v.y, v.z);

			return vector3.length() < max;
		};

		useTask(
			() => {
				if (isStatic(rigidBody.angvel(), angularMax) && isStatic(rigidBody.linvel(), linearMax)) {
					onstatic();
				}
			},
			{ after: rapier.simulationTask }
		);
	});
}