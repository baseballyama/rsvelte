import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<li> </li>`);
export default function Assignment_pattern_array_names($$anchor, $$props) {
	$.push($$props, true);
	let cheese = $.proxy(["a", "b"]);
	let other = [1, [2, 3]];
	function swap(a, b) {
		let x, y, z;
		[x, [y, z]] = other;
		({x, y: [z]} = {
			x: 1,
			y: [2]
		});
		for ([x, y] of [[1, 2]]) {}
	}
	var $$exports = { swap };
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.each(node, 17, () => cheese, $.index, ($$anchor, cheese, $$index, $$array_3) => {
		var li = root();
		var text = $.only_child(li, true);
		$.template_effect(() => $.set_text(text, $.get(cheese)));
		$.append($$anchor, li);
	});
	$.append($$anchor, fragment);
	return $.pop($$exports);
}
