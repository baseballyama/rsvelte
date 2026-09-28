import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

var root = $.from_html(`<!> <button> </button> <input type="checkbox"/>`, 1);

export default function Main($$anchor) {
	let open = $.state(true);
	let comp;
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(
		Component(node, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			}
		}),
		($$value) => comp = $$value,
		() => comp
	);

	var button = $.sibling(node, 2);
	var text = $.only_child(button, true);
	var input = $.sibling(button, 2);

	$.remove_input_defaults(input);
	$.template_effect(() => $.set_text(text, $.get(open)));

	$.delegated('click', button, () => {
		comp.open();
	});

	$.bind_checked(input, () => $.get(open), ($$value) => $.set(open, $$value));
	$.append($$anchor, fragment);
}

$.delegate(['click']);