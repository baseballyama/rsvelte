import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group } from 'three';
import { T, useThrelte, useTask, useStage } from '@threlte/core';
import { addSubscriber } from '../internal/inputSources.svelte.js';
import { useHand } from '../hooks/useHand.svelte.js';
import { useXROrigin } from '../hooks/useXROrigin.svelte.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Hand($$anchor, $$props) {
	$.push($$props, true);

	const $handStore = () => $.store_get(handStore, '$handStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/** Whether the XRHand should be matched with the left hand. */
	/** Whether the XRHand should be matched with the right hand. */
	/** Whether the XRHand should be matched with the left or right hand. */
	const { scene, renderer, renderStage } = useThrelte();

	const xrOrigin = useXROrigin();
	const attachTarget = $.derived(() => xrOrigin.current ?? scene);

	const handedness = $$props.left
		? 'left'
		: $$props.right ? 'right' : $$props.hand ?? 'left';

	const handStore = useHand(handedness);

	$.user_pre_effect(() => {
		return addSubscriber({
			type: 'hand',
			handedness,
			callbacks: {
				onconnected: $$props.onconnected,
				ondisconnected: $$props.ondisconnected,
				onpinchend: $$props.onpinchend,
				onpinchstart: $$props.onpinchstart
			}
		});
	});

	const xrHand = $.derived($handStore);
	const inputSource = $.derived(() => $.get(xrHand)?.inputSource);
	const model = $.derived(() => $.get(xrHand)?.model);
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
			const joint = $.get(inputSource)?.get('wrist');

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
			running: () => $.get(inputSource) !== undefined && ($$props.wrist !== undefined || $$props.children !== undefined)
		}
	);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			T(node_1, {
				get is() {
					return $.get(xrHand).hand;
				},

				get attach() {
					return $.get(attachTarget);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							T($$anchor, {
								get is() {
									return $.get(model);
								}
							});
						};

						$.if(node_2, ($$render) => {
							if ($$props.children === undefined) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					T($$anchor, {
						get is() {
							return $.get(xrHand).targetRay;
						},

						get attach() {
							return $.get(attachTarget);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_4 = $.first_child(fragment_5);

							$.snippet(node_4, () => $$props.targetRay);
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_3, ($$render) => {
					if ($$props.targetRay !== undefined) $$render(consequent_1);
				});
			}

			var node_5 = $.sibling(node_3, 2);

			T(node_5, {
				get is() {
					return group;
				},

				get attach() {
					return $.get(attachTarget);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_6 = $.first_child(fragment_6);

					$.snippet(node_6, () => $$props.wrist ?? $.noop);

					var node_7 = $.sibling(node_6, 2);

					$.snippet(node_7, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(xrHand)?.hand) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}