import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import C from './irrelevant';

var root = $.from_html(`<button>click me</button> <button xml:click="">click me</button> <button xmlns:click="">click me</button> <button xlink:click="">click me</button> <!> <!> <!> <!> <button foo:bar="">click me</button> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 8);

	C(node, {
		$$events: {
			click: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	C(node_1, { 'xml:click': true });

	var node_2 = $.sibling(node_1, 2);

	C(node_2, { 'xmlns:click': true });

	var node_3 = $.sibling(node_2, 2);

	C(node_3, { 'xlink:click': true });

	var node_4 = $.sibling(node_3, 4);

	C(node_4, { 'foo:bar': true });

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, fragment);
}