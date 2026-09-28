import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Portal, Text } from '@threlte/extras';
import { useRapier } from '@threlte/rapier';
import { Quaternion, Vector3 } from 'three';
import Impulse from './Impulse.svelte';
import { randomNumberInRange } from './utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Player($$anchor, $$props) {
	$.push($$props, true);

	const rapier = useRapier();
	let pressed = $.state(false);
	const power = 5;
	const playerOffset = new Vector3(randomNumberInRange($$props.min, $$props.max), -0.5, 0);
	const impulse = new Vector3();
	const origin = new Vector3();
	const offset = new Vector3();
	const quaternion = new Quaternion();

	const t = useTask(
		(delta) => {
			if (!$$props.rigidBody) return;

			const rotation = $$props.rigidBody.rotation();

			quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

			const translation = $$props.rigidBody.translation();

			origin.set(translation.x, translation.y, translation.z);
			offset.copy(playerOffset);
			offset.applyQuaternion(quaternion);
			origin.add(offset);
			impulse.set(0, power * delta, 0);
			impulse.applyQuaternion(quaternion);

			if (!$.get(pressed)) return;
			if (!$$props.active) return;

			$$props.rigidBody.applyImpulseAtPoint(impulse, origin, true);
		},
		{ before: rapier.simulationTask }
	);

	const thrusterActive = $.derived(() => $.get(pressed) && $$props.active);
	var fragment = root();

	$.event('keydown', $.window, (e) => {
		if (e.key === $$props.key) {
			$.set(pressed, true);
		}
	});

	$.event('keyup', $.window, (e) => {
		if (e.key === $$props.key) {
			$.set(pressed, false);
		}
	});

	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			'position.y': -0.5,
			get 'position.x'() {
				return playerOffset.x;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Text(node_1, {
					'position.y': -0.1,
					get text() {
						return $$props.key;
					},
					renderOrder: 1000
				});

				var node_2 = $.sibling(node_1, 2);

				$.snippet(node_2, () => $$props.children ?? $.noop, () => $.get(thrusterActive));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	Portal(node_3, {
		id: 'scene',
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => $.get(pressed) && $$props.active ? 10 : 1);

				Impulse($$anchor, {
					get origin() {
						return origin;
					},

					get impulse() {
						return impulse;
					},

					get afterTask() {
						return t.task;
					},

					get multiplier() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}