import * as $ from 'svelte/internal/server';
import { useTask } from '@threlte/core';
import { handJoints, useHandJoint } from '@threlte/xr';
import { Collider, RigidBody } from '@threlte/rapier';

export default function JointBody($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { jointIndex, hand } = $$props;
		let body = void 0;
		const joint = useHandJoint(hand, handJoints[jointIndex]);
		const radius = $.derived(() => $.store_get($$store_subs ??= {}, '$joint', joint)?.jointRadius);

		useTask(
			() => {
				if (joint.current === undefined || body === undefined) return;

				const { x, y, z } = joint.current.position;

				body.setNextKinematicTranslation({ x, y, z });
			},
			{
				running: () => body !== undefined && $.store_get($$store_subs ??= {}, '$joint', joint) !== undefined && radius() !== undefined
			}
		);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (radius()) {
				$$renderer.push('<!--[0-->');

				RigidBody($$renderer, {
					type: 'kinematicPosition',
					get rigidBody() {
						return body;
					},

					set rigidBody($$value) {
						body = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Collider($$renderer, { shape: 'ball', args: [radius()] });
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}