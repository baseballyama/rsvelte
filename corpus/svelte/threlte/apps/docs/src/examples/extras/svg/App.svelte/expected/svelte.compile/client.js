import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NoToneMapping } from 'three';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, List } from 'svelte-tweakpane-ui';

var root = $.from_html(`<div class="svelte-l9pgem"><!></div> <!>`, 1);

export default function App($$anchor) {
	const options = { logo: 0, ordering: 1 };
	let selection = 0;
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Canvas(node, {
		get toneMapping() {
			return NoToneMapping;
		},

		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get selection() {
					return selection;
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Pane(node_1, {
		position: 'fixed',
		title: 'SVG',
		children: ($$anchor, $$slotProps) => {
			List($$anchor, {
				label: 'scene',
				get options() {
					return options;
				},

				get value() {
					return selection;
				},

				set value($$value) {
					selection = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}