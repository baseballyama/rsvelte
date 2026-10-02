import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<ul></ul>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let cheese = ['Gruyere', 'Compté', 'Beaufort', 'Abondance'];

	function swap(a, b) {
		[cheese[a], cheese[b]] = [cheese[b], cheese[a]];
	}

	var $$exports = { swap };
	var ul = root_1();

	$.each(ul, 21, () => cheese, $.index, ($$anchor, cheese, $$index, $$array_1) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, $.get(cheese)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, ul);

	return $.pop($$exports);
}