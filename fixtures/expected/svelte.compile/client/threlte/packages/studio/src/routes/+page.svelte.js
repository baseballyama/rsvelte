import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Studio } from '$lib/index.js';
import { NoToneMapping } from 'three';

var root = $.from_html(`<div class="svelte-3ztvqh"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	Canvas(node, {
		get toneMapping() {
			return NoToneMapping;
		},

		children: ($$anchor, $$slotProps) => {
			Studio($$anchor, {
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