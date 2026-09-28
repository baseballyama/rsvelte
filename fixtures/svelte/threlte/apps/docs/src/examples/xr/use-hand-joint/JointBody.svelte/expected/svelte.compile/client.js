import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask } from '@threlte/core';
import { handJoints, useHandJoint } from '@threlte/xr';
import { Collider, RigidBody } from '@threlte/rapier';

export default function JointBody($$anchor, $$props) {
	$.push($$props, true);

	const $joint = () => $.store_get(joint, '$joint', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let body = $.state(void 0);
	const joint = useHandJoint($$props.hand, handJoints[$$props.jointIndex]);
	const radius = $.derived(() => $joint()?.jointRadius);

	useTask(
		() => {
			if (joint.current === undefined || $.get(body) === undefined) return;

			const { x, y, z } = joint.current.position;

			$.get(body).setNextKinematicTranslation({ x, y, z });
		},
		{
			running: () => $.get(body) !== undefined && $joint() !== undefined && $.get(radius) !== undefined
		}
	);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			RigidBody($$anchor, {
				type: 'kinematicPosition',
				get rigidBody() {
					return $.get(body);
				},

				set rigidBody($$value) {
					$.set(body, $$value);
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => [$.get(radius)]);

						Collider($$anchor, {
							shape: 'ball',
							get args() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(radius)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}