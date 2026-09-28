import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let obj = { key: 1, value: 3 };

	function mutate() {
		obj.value = 5;
	}

	function reassign() {
		obj = { key: 1, value: 7 };
	}

	function changeKey() {
		obj.key = 3;
	}

	var $$exports = { mutate, reassign, changeKey };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => obj.key, ($$anchor) => {
		var div = root();
		var text = $.only_child(div, true);

		$.template_effect(() => $.set_text(text, obj.value));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}