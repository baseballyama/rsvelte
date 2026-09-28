import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

export default function App($$renderer) {
	Canvas($$renderer, {
		children: ($$renderer) => {
			Scene($$renderer, {});
		},
		$$slots: { default: true }
	});
}