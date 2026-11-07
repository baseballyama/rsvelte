import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, extend } from '@threlte/core';
import Scene from './Scene.svelte';
import * as THREE from 'three/webgpu';

var root = $.from_html(`<div class="svelte-59pgiv"><!></div>`);

export default function App($$anchor, $$props) {
	$.push($$props, true);
	extend(THREE);

	var div = root();
	var node = $.child(div);

	Canvas(node, {
		createRenderer: (canvas) => {
			return new THREE.WebGPURenderer({ canvas, antialias: true, forceWebGL: false });
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