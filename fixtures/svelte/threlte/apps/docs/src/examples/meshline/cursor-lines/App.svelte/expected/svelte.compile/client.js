import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

var root = $.from_html(`<p class="svelte-3s0r1k">Move mouse around the canvas</p> <!>`, 1);

export default function App($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}