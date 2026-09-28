import * as $ from 'svelte/internal/server';
import { Spring } from 'svelte/motion';
import { T, useTask, useThrelte } from '@threlte/core';
import { teleportIntersection } from '../../internal/state.svelte.js';
import Cursor from './Cursor.svelte';
import { Group, Matrix3, Vector3 } from 'three';

const vec3 = new Vector3();
const normalMatrix = new Matrix3();
const worldNormal = new Vector3();

export default function TeleportCursor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { handedness, children } = $$props;
		const { scene } = useThrelte();
		const intersection = $.derived(() => teleportIntersection[handedness]);
		const ref = new Group();

		useTask(
			() => {
				if (intersection() === undefined) {
					return;
				}

				const { point, face, object } = intersection();

				ref.position.lerp(point, 0.4);

				if (face) {
					normalMatrix.getNormalMatrix(object.matrixWorld);
					worldNormal.copy(face.normal).applyMatrix3(normalMatrix).normalize();

					// lookAt from the lerped position (matches PointerCursor) — using the
					// raw hit point here causes orientation to wobble while position is
					// still easing toward the target.
					ref.lookAt(vec3.addVectors(ref.position, worldNormal));
				}
			},
			{ running: () => intersection() !== undefined }
		);

		const size = new Spring(0.1, { stiffness: 0.2 });

		T($$renderer, {
			is: ref,
			attach: scene,
			visible: intersection() !== undefined,
			children: ($$renderer) => {
				if (children) {
					$$renderer.push('<!--[0-->');
					children($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
					Cursor($$renderer, { size: size.current, thickness: 0.015 });
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}