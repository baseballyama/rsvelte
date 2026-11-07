import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from "./MyComponent.svelte";

var root = $.from_html(`<a class="link svelte-d2y4w7">Click me!</a> <!> <a>Click me two!</a> <b class="bold svelte-d2y4w7">Text 1</b> <!> <b data-key="val">Text 3</b>`, 1);

export default function Should_be_id_with_components01_input($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	MyComponent(node, {
		class: 'link',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Component');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 6);

	MyComponent(node_1, {
		class: 'bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Component');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.append($$anchor, fragment);
}