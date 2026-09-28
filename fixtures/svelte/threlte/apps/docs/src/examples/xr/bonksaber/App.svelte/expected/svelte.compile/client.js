import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { World } from '@threlte/rapier';
import { VRButton } from '@threlte/xr';
import Scene from './Scene.svelte';

var root = $.from_html(`<div class="svelte-ojo0kc"><!> <!></div>`);

export default function App($$anchor) {
	var div = root();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			World($$anchor, {
				gravity: [0, 0, 0],
				children: ($$anchor, $$slotProps) => {
					Scene($$anchor, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	VRButton(node_1, {});
	$.reset(div);
	$.append($$anchor, div);
}