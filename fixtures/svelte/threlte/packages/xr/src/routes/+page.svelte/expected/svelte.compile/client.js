import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { ARButton } from '$lib/index.js';
import Scene from './scene.svelte';

var root = $.from_html(`<main class="svelte-1ymd26p"><!> <!></main>`);

export default function _page($$anchor) {
	var main = root();
	var node = $.child(main);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ARButton(node_1, {
		sessionInit: {
			domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined,
			optionalFeatures: [
				'dom-overlay',
				'light-estimation',
				'dom-overlay-for-handheld-ar'
			]
		}
	});

	$.reset(main);
	$.append($$anchor, main);
}