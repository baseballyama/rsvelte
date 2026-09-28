import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<button>mutate</button> <!>`, 1);

export default function Main($$anchor) {
	let things = [{ text: 'hello' }];
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Nested(node, {
		get things() {
			return things;
		},
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const thing = $.derived(() => $$slotProps.thing);
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, $.get(thing).text));
				$.append($$anchor, span);
			}
		}
	});

	$.event('click', button, () => things[0].text = 'bye');
	$.append($$anchor, fragment);
}