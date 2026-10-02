import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FancyList from './FancyListFancyList.svelte';

var root = $.from_html(`<div> </div>`);

export default function Let_test_input($$anchor) {
	let items = [1, 2, 3];

	FancyList($$anchor, {
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
}