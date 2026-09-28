import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<button slot="footer">Button</button>`);
var root_1 = $.from_html(`<button>Disable</button> <!> <!>`, 1);

export default function Main($$anchor) {
	let disabled = false;
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Component(node, {
		$$slots: {
			footer: ($$anchor, $$slotProps) => {
				var button_1 = root();

				$.template_effect(() => button_1.disabled = disabled);
				$.append($$anchor, button_1);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Component(node_1, {
		$$slots: {
			footer: ($$anchor, $$slotProps) => {
				var button_2 = root();

				$.template_effect(() => button_2.disabled = disabled);
				$.append($$anchor, button_2);
			}
		}
	});

	$.event('click', button, () => disabled = !disabled);
	$.append($$anchor, fragment);
}