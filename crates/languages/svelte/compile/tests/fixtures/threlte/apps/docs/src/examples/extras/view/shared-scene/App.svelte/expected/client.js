import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div id="container" class="svelte-1ms9lf2"><!> <div id="minimap" class="svelte-1ms9lf2"></div></div>`);

export default function App($$anchor) {
	let minimap = $.state(void 0);
	var div = root_1();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					position: [1.6, 1.6, 3.6],
					fov: 50,
					oncreate: (ref) => ref.lookAt(0, 0, 0)
				});
			});

			var node_2 = $.sibling(node_1, 2);

			Scene(node_2, {
				get minimap() {
					return $.get(minimap);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			OrbitControls(node_3, {});
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);

	$.bind_this(div_1, ($$value) => $.set(minimap, $$value), () => $.get(minimap));
	$.reset(div);
	$.append($$anchor, div);
}