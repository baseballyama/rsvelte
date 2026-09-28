import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { WebGLRenderer } from 'three';

var root = $.from_html(`<div class="svelte-164bcz4"><!></div>`);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	Canvas(node, {
		createRenderer: (canvas) => {
			return new WebGLRenderer({ canvas, stencil: true });
		},

		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}