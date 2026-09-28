import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Item from './Item.svelte';

var root = $.from_html(`<input type="number" min="0"/> <!> <!> <!> <!> <!>`, 1);

export default function Main($$anchor) {
	let activeIndex = $.state(0);
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'max', 4);

	var node = $.sibling(input, 2);

	{
		let $0 = $.derived(() => $.get(activeIndex) == 0);

		Item(node, {
			get active() {
				return $.get($0);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(activeIndex) == 1);

		Item(node_1, {
			get active() {
				return $.get($0);
			}
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => $.get(activeIndex) == 2);

		Item(node_2, {
			get active() {
				return $.get($0);
			}
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => $.get(activeIndex) == 3);

		Item(node_3, {
			get active() {
				return $.get($0);
			}
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => $.get(activeIndex) == 4);

		Item(node_4, {
			get active() {
				return $.get($0);
			}
		});
	}

	$.bind_value(input, () => $.get(activeIndex), ($$value) => $.set(activeIndex, $$value));
	$.append($$anchor, fragment);
}