import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FancyList from './FancyListFancyList.svelte';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Let_test_input($$anchor) {
	let items = [1, 2, 3];
	var fragment = root_1();
	var node = $.first_child(fragment);

	FancyList(node, {
		get items() {
			return items;
		},
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const thing = $.derived(() => $$slotProps.a);
				const thing2 = $.derived(() => $$slotProps.b);
				var div = root();
				var text = $.only_child(div, true);

				$.template_effect(() => $.set_text(text, $.get(thing).text));
				$.append($$anchor, div);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	FancyList(node_1, {
		get items() {
			return items;
		},
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const thing = $.derived(() => $$slotProps.a);
				const thing2 = $.derived(() => $$slotProps.b);
				var div_1 = root();
				var text_1 = $.only_child(div_1, true);

				$.template_effect(() => $.set_text(text_1, $.get(thing).text));
				$.append($$anchor, div_1);
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	FancyList(node_2, {
		get items() {
			return items;
		},
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const thing2 = $.derived(() => $$slotProps.b);
				const thing = $.derived(() => $$slotProps.a);
				var div_2 = root();
				var text_2 = $.only_child(div_2, true);

				$.template_effect(() => $.set_text(text_2, $.get(thing).text));
				$.append($$anchor, div_2);
			}
		}
	});

	$.append($$anchor, fragment);
}