import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

var root = $.from_html(`<main class="svelte-vobrrm"><!></main>`);

export default function _page($$anchor) {
	var main = root();
	var node = $.child(main);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(main);
	$.append($$anchor, main);
}