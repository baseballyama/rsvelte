import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask } from '@threlte/core';
import { useRapier } from '@threlte/rapier';
import { Vector3 } from 'three';

export default function IsStatic($$anchor, $$props) {
	$.push($$props, true);

	const rapier = useRapier();
	const vector3 = new Vector3();

	const isStatic = (v, max) => {
		vector3.set(v.x, v.y, v.z);

		return vector3.length() < max;
	};

	useTask(
		() => {
			if (isStatic($$props.rigidBody.angvel(), $$props.angularMax) && isStatic($$props.rigidBody.linvel(), $$props.linearMax)) {
				$$props.onstatic();
			}
		},
		{ after: rapier.simulationTask }
	);

	$.pop();
}