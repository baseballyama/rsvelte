import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Hand, XR, useXR } from '@threlte/xr';
import { Text } from '@threlte/extras';
import { Attractor, Debug } from '@threlte/rapier';
import JointCollider from './JointBody.svelte';
import Cubes from './Cube.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $isHandTracking = () => $.store_get(isHandTracking, '$isHandTracking', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { isHandTracking } = useXR();
	let debug = false;
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Debug($$anchor, {});
		};

		$.if(node, ($$render) => {
			if (debug) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	XR(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_2 = $.first_child(fragment_2);

			Hand(node_2, { left: true, onpinchend: () => debug = !debug });

			var node_3 = $.sibling(node_2, 2);

			Hand(node_3, { right: true, onpinchend: () => debug = !debug });

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_5 = $.first_child(fragment_3);

					$.each(node_5, 16, () => ({ length: 25 }), $.index, ($$anchor, _, jointIndex) => {
						var fragment_4 = root();
						var node_6 = $.first_child(fragment_4);

						JointCollider(node_6, { jointIndex, hand: 'left' });

						var node_7 = $.sibling(node_6, 2);

						JointCollider(node_7, { jointIndex, hand: 'right' });
						$.append($$anchor, fragment_4);
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_4, ($$render) => {
					if ($isHandTracking()) $$render(consequent_1);
				});
			}

			var node_8 = $.sibling(node_4, 2);

			Text(node_8, {
				position: [0, 1.7, -1],
				text: 'Pinch to toggle physics debug.'
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_1, 2);

	Cubes(node_9, {});

	var node_10 = $.sibling(node_9, 2);

	$.component(node_10, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0, 1, 1],
			oncreate: (ref) => ref.lookAt(0, 1.8, 0)
		});
	});

	var node_11 = $.sibling(node_10, 2);

	$.component(node_11, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_12 = $.sibling(node_11, 2);

	$.component(node_12, () => T.SpotLight, ($$anchor, T_SpotLight) => {
		T_SpotLight($$anchor, {
			position: [1, 8, 1],
			angle: 0.3,
			penumbra: 1,
			intensity: 30,
			castShadow: true,
			'target.x': 0,
			'target.y': 1.8,
			'target.z': 0
		});
	});

	var node_13 = $.sibling(node_12, 2);

	Attractor(node_13, { range: 50, strength: 0.000001, position: [0, 1.7, 0] });
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}