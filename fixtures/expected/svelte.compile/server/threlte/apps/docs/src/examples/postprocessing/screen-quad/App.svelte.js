import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';

export default function App($$renderer) {
	Canvas($$renderer, {
		autoRender: false,
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});
}