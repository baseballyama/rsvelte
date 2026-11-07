import 'svelte/internal/disclose-version';
import { Group, Vector3, Matrix3 } from 'three';
import * as $ from 'svelte/internal/client';
import { T, useTask, useThrelte } from '@threlte/core';
import { untrack } from 'svelte';
import { pointerIntersection, pointerState } from '../../internal/state.svelte.js';
import Cursor from './Cursor.svelte';

const vec3 = new Vector3();
const normalMatrix = new Matrix3();
const worldNormal = new Vector3();

export default function PointerCursor($$anchor, $$props) {
	$.push($$props, true);

	const { scene } = useThrelte();
	const hovering = $.derived(() => pointerState[$$props.handedness].hovering);
	const intersection = $.derived(() => pointerIntersection[$$props.handedness]);
	const ref = new Group();
	const SURFACE_OFFSET = 0.002;

	useTask(
		() => {
			if ($.get(intersection) === undefined) {
				return;
			}

			const { point, face, object } = $.get(intersection);

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
		{
			running: () => $.get(hovering) && $.get(intersection) !== undefined
		}
	);

	// Snap to the hit point on hover entry so the reticle doesn't visibly
	// fly in from its previous location. `intersection` is read untracked
	// so this only reruns on hover transitions, not every frame.
	$.user_pre_effect(() => {
		if (!$.get(hovering)) return;

		untrack(() => {
			if ($.get(intersection)) {
				ref.position.copy($.get(intersection).point);
			}
		});
	});

	T($$anchor, {
		get is() {
			return ref;
		},

		get attach() {
			return scene;
		},

		get visible() {
			return $.get(hovering);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					Cursor($$anchor, {});
				};

				$.if(node, ($$render) => {
					if ($$props.children) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}