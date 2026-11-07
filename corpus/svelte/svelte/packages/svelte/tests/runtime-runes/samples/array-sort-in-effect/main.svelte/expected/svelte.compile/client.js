import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>add item</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let arr = $.proxy([100, 0, 50]);
	let nextValues = [20, 80];
	let valueIndex = 0;

	$.user_effect(() => {
		arr.sort((a, b) => a - b);
	});

	function addItem() {
		if (valueIndex < nextValues.length) {
			arr.push(nextValues[valueIndex]);
			valueIndex++;
		}
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => arr, $.index, ($$anchor, x) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(x)));
		$.append($$anchor, p);
	});

	$.delegated('click', button, addItem);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);