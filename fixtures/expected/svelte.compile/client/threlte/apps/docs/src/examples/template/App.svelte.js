import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import { Pane, Checkbox } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <div class="svelte-3nylqy"><!></div>`, 1);

export default function App($$anchor) {
	let showScene = true;
	var fragment = root();
	var node = $.first_child(fragment);

	Pane(node, {
		title: '',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				get value() {
					return showScene;
				},

				set value($$value) {
					showScene = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Canvas(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			{
				var consequent = ($$anchor) => {
					Scene($$anchor, {});
				};

				$.if(node_2, ($$render) => {
					if (showScene) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}