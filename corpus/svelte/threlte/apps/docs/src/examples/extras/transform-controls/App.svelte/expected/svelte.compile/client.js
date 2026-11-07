import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import Settings from './Settings.svelte';

var root = $.from_html(`<div class="svelte-1909cwx"><!></div> <!>`, 1);

export default function App($$anchor) {
	let controls = $.state('<OrbitControls>');
	let autoPauseControls = $.state(true);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get controls() {
					return $.get(controls);
				},

				get autoPauseControls() {
					return $.get(autoPauseControls);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Settings(node_1, {
		get controls() {
			return $.get(controls);
		},

		set controls($$value) {
			$.set(controls, $$value, true);
		},

		get autoPauseControls() {
			return $.get(autoPauseControls);
		},

		set autoPauseControls($$value) {
			$.set(autoPauseControls, $$value, true);
		}
	});

	$.append($$anchor, fragment);
}