import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Project, Sequence, Sheet, Studio } from '@threlte/theatre';
import Scene from './Scene.svelte';
import state from './state.json';

var root = $.from_html(`<!> <!>`, 1);

export default function App($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Studio(node, {});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({ state }));

		Project(node_1, {
			get config() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				Sheet($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Sequence(node_2, {});

						var node_3 = $.sibling(node_2, 2);

						Scene(node_3, {});
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
}