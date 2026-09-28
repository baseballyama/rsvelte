import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

var root = $.from_html(`<div class="svelte-12itv1x"><!> <ul class="svelte-12itv1x"><li>Press <b>S</b> to toggle scope mode.</li> <li><b>Mousewheel</b> or <b>A/D</b> to adjust zoom level.</li></ul></div>`);

export default function App($$anchor) {
	var div = root();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}