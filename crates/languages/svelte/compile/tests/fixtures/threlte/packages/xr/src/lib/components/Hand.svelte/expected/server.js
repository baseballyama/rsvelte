import * as $ from 'svelte/internal/server';
import { Group } from 'three';
import { T, useThrelte, useTask, useStage } from '@threlte/core';
import { addSubscriber } from '../internal/inputSources.svelte.js';
import { useHand } from '../hooks/useHand.svelte.js';
import { useXROrigin } from '../hooks/useXROrigin.svelte.js';

export default function Hand($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/** Whether the XRHand should be matched with the left hand. */
		/** Whether the XRHand should be matched with the right hand. */
		/** Whether the XRHand should be matched with the left or right hand. */
		const {
			left,
			right,
			hand,
			onconnected,
			ondisconnected,
			onpinchend,
			onpinchstart,
			children,
			targetRay,
			wrist
		} = $$props;

		const { scene, renderer, renderStage } = useThrelte();
		const xrOrigin = useXROrigin();
		const attachTarget = $.derived(() => xrOrigin.current ?? scene);
		const handedness = left ? 'left' : right ? 'right' : hand ?? 'left';
		const handStore = useHand(handedness);
		const xrHand = $.derived(() => $.store_get($$store_subs ??= {}, '$handStore', handStore));
		const inputSource = $.derived(() => xrHand()?.inputSource);
		const model = $.derived(() => xrHand()?.model);
		const stage = useStage(Symbol('xr-hand-stage'), { before: renderStage });
		const group = new Group();

		/**
		 * Currently children of a hand XRSpace or model will not
		 * move relative to their parent, so this hack of checking wrist position
		 * and syncing any snippets is used.
		 *
		 * @todo(mp) investigate why this is happening and see if there's
		 * a way to just parent to the hand to avoid this.
		 */
		useTask(
			() => {
				const frame = renderer.xr.getFrame();
				const space = renderer.xr.getReferenceSpace();
				const joint = inputSource()?.get('wrist');

				if (joint === undefined || space === null) return;

				const pose = frame.getJointPose?.(joint, space);

				// This isn't correctly typed by @types/xr. Pose can also be null.
				if (pose === undefined || pose === null) return;

				const { position, orientation } = pose.transform;

				group.position.set(position.x, position.y, position.z);
				group.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
			},
			{
				stage,
				running: () => inputSource() !== undefined && (wrist !== undefined || children !== undefined)
			}
		);

		if (xrHand()?.hand) {
			$$renderer.push('<!--[0-->');

			T($$renderer, {
				is: xrHand().hand,
				attach: attachTarget(),
				children: ($$renderer) => {
					if (children === undefined) {
						$$renderer.push('<!--[0-->');
						T($$renderer, { is: model() });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (targetRay !== undefined) {
				$$renderer.push('<!--[0-->');

				T($$renderer, {
					is: xrHand().targetRay,
					attach: attachTarget(),
					children: ($$renderer) => {
						targetRay($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			T($$renderer, {
				is: group,
				attach: attachTarget(),
				children: ($$renderer) => {
					wrist?.($$renderer);
					$$renderer.push(`<!----> `);
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}