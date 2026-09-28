import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Theatre } from '@threlte/theatre';
import Scene from './Scene.svelte';

var root = $.from_html(`<div class="svelte-ot2p6r"><!></div>`);

export default function App($$anchor) {
	var div = root();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Theatre($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Scene($$anchor, {});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}