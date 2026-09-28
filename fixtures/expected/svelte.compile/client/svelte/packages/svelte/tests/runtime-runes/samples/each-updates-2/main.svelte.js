import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<button>Add Item</button> <!>`, 1);

export default function Main($$anchor) {
	let arr = $.proxy([]);
	let counter = 0;

	function addItem() {
		arr.push(`${counter++}`);
	}

	function removeItem(i) {
		arr.splice(i, 1);
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => arr, $.index, ($$anchor, item, i) => {
		var button_1 = root();
		var text = $.only_child(button_1);

		$.template_effect(() => $.set_text(text, `Index ${i} | Item ${$.get(item) ?? ''}`));
		$.delegated('click', button_1, () => removeItem(i));
		$.append($$anchor, button_1);
	});

	$.delegated('click', button, addItem);
	$.append($$anchor, fragment);
}

$.delegate(['click']);