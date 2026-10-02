import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { useController } from '../hooks/useController.svelte.js';
import { pointerState, teleportState } from '../internal/state.svelte.js';
import { addSubscriber } from '../internal/inputSources.svelte.js';
import { useXROrigin } from '../hooks/useXROrigin.svelte.js';
import PointerCursor from './internal/PointerCursor.svelte';
import ShortRay from './internal/ShortRay.svelte';
import TeleportCursor from './internal/TeleportCursor.svelte';
import TeleportRay from './internal/TeleportRay.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Controller($$anchor, $$props) {
	$.push($$props, true);

	const $controller = () => $.store_get(controller, '$controller', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/** Whether the controller should be matched with the left hand. */
	/** Whether the controller should be matched with the right hand. */
	/** Whether the controller should be matched with the left or right hand. */
	const { scene } = useThrelte();

	const xrOrigin = useXROrigin();
	const attachTarget = $.derived(() => xrOrigin.current ?? scene);

	const handedness = $$props.left
		? 'left'
		: $$props.right ? 'right' : $$props.hand ?? 'left';

	const controller = useController(handedness);

	$.user_pre_effect(() => {
		return addSubscriber({
			type: 'controller',
			handedness,
			callbacks: {
				onconnected: $$props.onconnected,
				ondisconnected: $$props.ondisconnected,
				onselect: $$props.onselect,
				onselectend: $$props.onselectend,
				onselectstart: $$props.onselectstart,
				onsqueeze: $$props.onsqueeze,
				onsqueezeend: $$props.onsqueezeend,
				onsqueezestart: $$props.onsqueezestart
			}
		});
	});

	const grip = $.derived(() => $controller()?.grip);
	const targetRay = $.derived(() => $controller()?.targetRay);
	const model = $.derived(() => $controller()?.model);

	const hasPointerControls = $.derived(() => handedness === 'left'
		? pointerState.left.enabled
		: pointerState.right.enabled);

	const hasTeleportControls = $.derived(() => handedness === 'left'
		? teleportState.left.enabled
		: teleportState.right.enabled);

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			T($$anchor, {
				get is() {
					return $.get(grip);
				},

				get attach() {
					return $.get(attachTarget);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.snippet(node_2, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							T($$anchor, {
								get is() {
									return $.get(model);
								}
							});
						};

						$.if(node_1, ($$render) => {
							if ($$props.children) $$render(consequent); else $$render(alternate, -1);
						});
					}

					var node_3 = $.sibling(node_1, 2);

					$.snippet(node_3, () => $$props.grip ?? $.noop);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(grip)) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			T($$anchor, {
				get is() {
					return $.get(targetRay);
				},

				get attach() {
					return $.get(attachTarget);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_5 = $.first_child(fragment_6);

					$.snippet(node_5, () => $$props.targetRay ?? $.noop);

					var node_6 = $.sibling(node_5, 2);

					{
						var consequent_2 = ($$anchor) => {
							ShortRay($$anchor, {
								get handedness() {
									return handedness;
								},

								get children() {
									return $$props.pointerRay;
								}
							});
						};

						$.if(node_6, ($$render) => {
							if ($.get(hasPointerControls) || $.get(hasTeleportControls)) $$render(consequent_2);
						});
					}

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_4, ($$render) => {
			if ($.get(targetRay)) $$render(consequent_3);
		});
	}

	var node_7 = $.sibling(node_4, 2);

	{
		var consequent_4 = ($$anchor) => {
			PointerCursor($$anchor, {
				get handedness() {
					return handedness;
				},

				get children() {
					return $$props.pointerCursor;
				}
			});
		};

		$.if(node_7, ($$render) => {
			if ($.get(hasPointerControls)) $$render(consequent_4);
		});
	}

	var node_8 = $.sibling(node_7, 2);

	{
		var consequent_5 = ($$anchor) => {
			var fragment_9 = root();
			var node_9 = $.first_child(fragment_9);

			TeleportRay(node_9, {
				get targetRay() {
					return $.get(targetRay);
				},

				get handedness() {
					return handedness;
				},

				get children() {
					return $$props.teleportRay;
				}
			});

			var node_10 = $.sibling(node_9, 2);

			TeleportCursor(node_10, {
				get handedness() {
					return handedness;
				},

				get children() {
					return $$props.teleportCursor;
				}
			});

			$.append($$anchor, fragment_9);
		};

		$.if(node_8, ($$render) => {
			if ($.get(hasTeleportControls) && $.get(targetRay) !== undefined) $$render(consequent_5);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}