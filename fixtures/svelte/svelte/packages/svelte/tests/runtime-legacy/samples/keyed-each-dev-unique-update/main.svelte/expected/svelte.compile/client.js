import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<button>add</button> <ul></ul>`, 1);

export default function Main($$anchor) {
	let data = [[0, 0], [0, 4], [1, 4]];

	function add() {
		const n = [0, 0];

		data.push(n);
		data = data;
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var ul = $.sibling(button, 2);

	$.each(ul, 21, () => data, (d) => d.join(""), ($$anchor, d) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, $.get(d)));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.delegated('click', button, add);
	$.append($$anchor, fragment);
}

$.delegate(['click']);