import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, T } from '@threlte/core';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-126ywpt"><!></div>`);

export default function App($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Scene(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
				T_DirectionalLight($$anchor, { intensity: 2, castShadow: true, position: [1, 1, 1] });
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}