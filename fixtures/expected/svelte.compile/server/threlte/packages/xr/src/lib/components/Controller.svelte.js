import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { useController } from '../hooks/useController.svelte.js';
import { pointerState, teleportState } from '../internal/state.svelte.js';
import { addSubscriber } from '../internal/inputSources.svelte.js';
import { useXROrigin } from '../hooks/useXROrigin.svelte.js';
import PointerCursor from './internal/PointerCursor.svelte';
import ShortRay from './internal/ShortRay.svelte';
import TeleportCursor from './internal/TeleportCursor.svelte';
import TeleportRay from './internal/TeleportRay.svelte';

export default function Controller($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/** Whether the controller should be matched with the left hand. */
		/** Whether the controller should be matched with the right hand. */
		/** Whether the controller should be matched with the left or right hand. */
		let {
			left,
			right,
			hand,
			onconnected,
			ondisconnected,
			onselect,
			onselectend,
			onselectstart,
			onsqueeze,
			onsqueezeend,
			onsqueezestart,
			children,
			grip: gripSnippet,
			targetRay: targetRaySnippet,
			pointerRay: pointerRaySnippet,
			pointerCursor: pointerCursorSnippet,
			teleportRay: teleportRaySnippet,
			teleportCursor: teleportCursorSnippet
		} = $$props;

		const { scene } = useThrelte();
		const xrOrigin = useXROrigin();
		const attachTarget = $.derived(() => xrOrigin.current ?? scene);
		const handedness = left ? 'left' : right ? 'right' : hand ?? 'left';
		const controller = useController(handedness);
		const grip = $.derived(() => $.store_get($$store_subs ??= {}, '$controller', controller)?.grip);
		const targetRay = $.derived(() => $.store_get($$store_subs ??= {}, '$controller', controller)?.targetRay);
		const model = $.derived(() => $.store_get($$store_subs ??= {}, '$controller', controller)?.model);

		const hasPointerControls = $.derived(() => handedness === 'left'
			? pointerState.left.enabled
			: pointerState.right.enabled);

		const hasTeleportControls = $.derived(() => handedness === 'left'
			? teleportState.left.enabled
			: teleportState.right.enabled);

		if (grip()) {
			$$renderer.push('<!--[0-->');

			T($$renderer, {
				is: grip(),
				attach: attachTarget(),
				children: ($$renderer) => {
					if (children) {
						$$renderer.push('<!--[0-->');
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
						T($$renderer, { is: model() });
					}

					$$renderer.push(`<!--]--> `);
					gripSnippet?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (targetRay()) {
			$$renderer.push('<!--[0-->');

			T($$renderer, {
				is: targetRay(),
				attach: attachTarget(),
				children: ($$renderer) => {
					targetRaySnippet?.($$renderer);
					$$renderer.push(`<!----> `);

					if (hasPointerControls() || hasTeleportControls()) {
						$$renderer.push('<!--[0-->');
						ShortRay($$renderer, { handedness, children: pointerRaySnippet });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (hasPointerControls()) {
			$$renderer.push('<!--[0-->');
			PointerCursor($$renderer, { handedness, children: pointerCursorSnippet });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (hasTeleportControls() && targetRay() !== undefined) {
			$$renderer.push('<!--[0-->');

			TeleportRay($$renderer, {
				targetRay: targetRay(),
				handedness,
				children: teleportRaySnippet
			});

			$$renderer.push(`<!----> `);
			TeleportCursor($$renderer, { handedness, children: teleportCursorSnippet });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}