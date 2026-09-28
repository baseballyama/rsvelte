import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search } from "carbon-components-svelte";

var root = $.from_html(`<!> <br/> <strong>Expanded:</strong> `, 1);

export default function SearchExpandableReactive($$anchor, $$props) {
	let expanded = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Search(node, {
		expandable: true,
		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		$$events: {
			expand: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},

			collapse: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});

	var text = $.sibling(node, 5);

	$.template_effect(() => $.set_text(text, ` ${expanded ?? ''}`));
	$.append($$anchor, fragment);
}