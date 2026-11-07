import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from "./MyComponent.svelte";

var root = $.from_html(`<a class="link svelte-uy77io">Click me!</a> <a class="link svelte-uy77io">Click me two!</a> <!> <b class="bold svelte-uy77io">Text 1</b> <b class="bold svelte-uy77io" data-key="val">Text 2</b> <!> <i id="italic" class="svelte-uy77io">Italic</i> <!>`, 1);

export default function Should_be_type_with_components01_input($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

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

	var node_2 = $.sibling(node_1, 4);

	MyComponent(node_2, {
		id: 'italic',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Component');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}