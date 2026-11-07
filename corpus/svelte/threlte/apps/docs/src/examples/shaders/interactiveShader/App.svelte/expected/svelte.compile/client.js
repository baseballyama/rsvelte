import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

var root = $.from_html(`<div class="svelte-1uojcvo"><!> <span class="absolute top-4 left-4 z-20 whitespace-nowrap text-white">Click on the terrain</span></div>`);

export default function App($$anchor) {
	var div = root();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}