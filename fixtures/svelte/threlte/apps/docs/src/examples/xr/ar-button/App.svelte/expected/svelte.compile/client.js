import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { ARButton } from '@threlte/xr';
import Scene from './Scene.svelte';

var root = $.from_html(`<div class="svelte-nzushx"><!> <!></div>`);

export default function App($$anchor) {
	var div = root();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ARButton(node_1, {});
	$.reset(div);
	$.append($$anchor, div);
}