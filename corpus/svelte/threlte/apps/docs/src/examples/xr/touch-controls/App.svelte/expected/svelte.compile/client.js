import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, Canvas } from '@threlte/core';
import { XR, VRButton } from '@threlte/xr';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-xj7z8v"><!> <!></div>`);

export default function App($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Scene(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			{
				const fallback = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					$.component(node_3, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
						T_PerspectiveCamera($$anchor, {
							makeDefault: true,
							position: [0, 1.5, 0.5],
							oncreate: (ref) => {
								ref.lookAt(0, 1.3, 0);
							}
						});
					});

					$.append($$anchor, fragment_1);
				};

				XR(node_2, { fallback, $$slots: { fallback: true } });
			}

			var node_4 = $.sibling(node_2, 2);

			$.component(node_4, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
				T_AmbientLight($$anchor, {});
			});

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
				T_DirectionalLight($$anchor, { intensity: 1.5, position: [1, 1, 1] });
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	VRButton(node_6, {});
	$.reset(div);
	$.append($$anchor, div);
}