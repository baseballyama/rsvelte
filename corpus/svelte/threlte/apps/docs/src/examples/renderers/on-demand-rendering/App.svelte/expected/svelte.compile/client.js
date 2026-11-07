import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import RenderIndicator from './RenderIndicator.svelte';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="wrapper svelte-ujr49h"><!> <div class="description svelte-ujr49h"><p><strong>Click and drag</strong> to rotate the camera.</p> <p><strong>Hover</strong> over the sphere to scale it up.</p></div></div>`);

export default function App($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Scene(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			RenderIndicator(node_2, {});
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}