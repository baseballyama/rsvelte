import * as $ from 'svelte/internal/server';
import { T, useTask, useThrelte } from '@threlte/core';
import { untrack } from 'svelte';
import { pointerIntersection, pointerState } from '../../internal/state.svelte.js';
import Cursor from './Cursor.svelte';
import { Group, Vector3, Matrix3 } from 'three';

const vec3 = new Vector3();
const normalMatrix = new Matrix3();
const worldNormal = new Vector3();

export default function PointerCursor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { handedness, children } = $$props;
		const { scene } = useThrelte();
		const hovering = $.derived(() => pointerState[handedness].hovering);
		const intersection = $.derived(() => pointerIntersection[handedness]);
		const ref = new Group();
		const SURFACE_OFFSET = 0.002;

		useTask(
			() => {
				if (intersection() === undefined) {
					return;
				}

				const { point, face, object } = intersection();

				ref.position.lerp(point, 0.4);

				if (face === null || face === undefined) {
					return;
				}

				normalMatrix.getNormalMatrix(object.matrixWorld);
				worldNormal.copy(face.normal).applyMatrix3(normalMatrix).normalize();

				// Float the reticle just above the surface so it doesn't z-fight
				// with the coplanar face underneath.
				ref.position.addScaledVector(worldNormal, SURFACE_OFFSET);

				ref.lookAt(vec3.addVectors(ref.position, worldNormal));
			},
			{ running: () => hovering() && intersection() !== undefined }
		);

		T($$renderer, {
			is: // Snap to the hit point on hover entry so the reticle doesn't visibly
			// fly in from its previous location. `intersection` is read untracked
			// so this only reruns on hover transitions, not every frame.
			ref,
			attach: scene,
			visible: hovering(),
			children: ($$renderer) => {
				if (children) {
					$$renderer.push('<!--[0-->');
					children($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
					Cursor($$renderer, {});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}