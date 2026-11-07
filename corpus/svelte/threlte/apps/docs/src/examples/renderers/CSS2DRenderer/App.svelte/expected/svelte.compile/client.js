import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';

var root = $.from_html(`<div id="css-renderer-target" class="svelte-sscyvt"></div> <div id="main" class="svelte-sscyvt"><!></div>`, 1);

export default function App($$anchor) {
	let element = $.state(void 0);
	var fragment = root();
	var div = $.first_child(fragment);

	$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));

	var div_1 = $.sibling(div, 2);
	var node = $.child(div_1);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Scene($$anchor, {
						get element() {
							return $.get(element);
						}
					});
				};

				$.if(node_1, ($$render) => {
					if ($.get(element) !== undefined) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}