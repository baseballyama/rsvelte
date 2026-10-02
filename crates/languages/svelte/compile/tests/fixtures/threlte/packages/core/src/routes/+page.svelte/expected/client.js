import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '../lib/index.js';
import Scene from './scene.svelte';

var root = $.from_html(`<main class="svelte-1b8f432"><!></main>`);

export default function _page($$anchor) {
	var main = root();
	var node = $.child(main);

	Canvas(node, {
		renderMode: 'always',
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(main);
	$.append($$anchor, main);
}