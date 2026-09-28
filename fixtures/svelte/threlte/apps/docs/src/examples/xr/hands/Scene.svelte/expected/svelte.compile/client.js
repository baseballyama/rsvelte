import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Mesh } from 'three';
import { T } from '@threlte/core';
import { XR, Hand, Controller } from '@threlte/xr';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const boxes = $.proxy([]);

	const handleEvent = (event) => {
		console.log('Hand', event);

		if (event.type === 'pinchend') {
			createBox(event);
		}
	};

	const handleControllerEvent = (event) => {
		console.log('Controller', event);
	};

	const createBox = (event) => {
		const controller = event.target;
		const indexTip = controller?.joints['index-finger-tip'];

		if (!indexTip) return;

		const box = new Mesh();

		box.position.copy(indexTip.position);
		box.quaternion.copy(indexTip.quaternion);
		boxes.push(box);
	};

	const hands = ['left', 'right'];
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const fallback = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					position: [0, 1.8, 1],
					oncreate: (ref) => ref.lookAt(0, 1.8, 0)
				});
			});

			$.append($$anchor, fragment_1);
		};

		XR(node, {
			fallback,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.each(node_2, 16, () => hands, (hand) => hand, ($$anchor, hand) => {
					var fragment_3 = root();
					var node_3 = $.first_child(fragment_3);

					Hand(node_3, {
						get hand() {
							return hand;
						},
						onconnected: handleEvent,
						ondisconnected: handleEvent,
						onpinchstart: handleEvent,
						onpinchend: handleEvent
					});

					var node_4 = $.sibling(node_3, 2);

					Controller(node_4, {
						get hand() {
							return hand;
						},
						onconnected: handleControllerEvent,
						ondisconnected: handleControllerEvent,
						onselect: handleControllerEvent,
						onsqueeze: handleControllerEvent,
						onselectstart: handleControllerEvent,
						onselectend: handleControllerEvent,
						onsqueezestart: handleControllerEvent,
						onsqueezeend: handleControllerEvent
					});

					$.append($$anchor, fragment_3);
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { fallback: true, default: true }
		});
	}

	var node_5 = $.sibling(node, 2);

	$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			rotation: [-Math.PI / 2, 0, 0],
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_6 = $.first_child(fragment_4);

				$.component(node_6, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [1] });
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, {});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_5, 2);

	$.component(node_8, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_9 = $.sibling(node_8, 2);

	$.component(node_9, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {});
	});

	var node_10 = $.sibling(node_9, 2);

	$.each(node_10, 17, () => boxes, (box) => box.uuid, ($$anchor, box) => {
		T($$anchor, {
			get is() {
				return $.get(box);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root();
				var node_11 = $.first_child(fragment_6);

				$.component(node_11, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, { args: [0.05, 0.05, 0.05] });
				});

				var node_12 = $.sibling(node_11, 2);

				$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: Math.random() * 0xffffff });
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}