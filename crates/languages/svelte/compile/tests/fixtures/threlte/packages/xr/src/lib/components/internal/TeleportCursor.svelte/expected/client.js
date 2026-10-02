import 'svelte/internal/disclose-version';
import { Group, Matrix3, Vector3 } from 'three';
import * as $ from 'svelte/internal/client';
import { Spring } from 'svelte/motion';
import { T, useTask, useThrelte } from '@threlte/core';
import { teleportIntersection } from '../../internal/state.svelte.js';
import Cursor from './Cursor.svelte';

const vec3 = new Vector3();
const normalMatrix = new Matrix3();
const worldNormal = new Vector3();

export default function TeleportCursor($$anchor, $$props) {
	$.push($$props, true);

	const { scene } = useThrelte();
	const intersection = $.derived(() => teleportIntersection[$$props.handedness]);
	const ref = new Group();

	useTask(
		() => {
			if ($.get(intersection) === undefined) {
				return;
			}

			const { point, face, object } = $.get(intersection);

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
		{ running: () => $.get(intersection) !== undefined }
	);

	const size = new Spring(0.1, { stiffness: 0.2 });

	$.user_pre_effect(() => {
		if ($.get(intersection) === undefined) {
			size.set(0.1);
		} else {
			size.set(1);
			ref.position.copy($.get(intersection).point);
		}
	});

	{
		let $0 = $.derived(() => $.get(intersection) !== undefined);

		T($$anchor, {
			get is() {
				return ref;
			},

			get attach() {
				return scene;
			},

			get visible() {
				return $.get($0);
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
						Cursor($$anchor, {
							get size() {
								return size.current;
							},
							thickness: 0.015
						});
					};

					$.if(node, ($$render) => {
						if ($$props.children) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}