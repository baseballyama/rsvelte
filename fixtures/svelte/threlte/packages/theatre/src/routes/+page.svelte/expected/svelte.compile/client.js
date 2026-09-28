import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Theatre } from '$lib/index.js';
import Scene from './scene.svelte';

var root = $.from_html(`<main class="svelte-7o2h8q"><!></main>`);

export default function _page($$anchor) {
	var main = root();
	var node = $.child(main);

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

	$.reset(main);
	$.append($$anchor, main);
}