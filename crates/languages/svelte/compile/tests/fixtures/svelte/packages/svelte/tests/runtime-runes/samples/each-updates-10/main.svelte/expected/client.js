import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<button>add</button> <button>adjust</button> <h2>Keyed</h2> <!> <h2>Unkeyed</h2> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const items = $.proxy([{ t: 0 }]);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 4);

	$.each(node, 18, () => items, (item) => item, ($$anchor, item, index) => {
		var div = root();
		var text = $.only_child(div);

		$.template_effect(() => $.set_text(text, `Item: ${item.t ?? ''}. Index: ${$.get(index) ?? ''}`));
		$.append($$anchor, div);
	});

	var node_1 = $.sibling(node, 4);

	$.each(node_1, 17, () => items, $.index, ($$anchor, item, index) => {
		var div_1 = root();
		var text_1 = $.only_child(div_1);

		$.template_effect(() => $.set_text(text_1, `Item: ${$.get(item).t ?? ''}. Index: ${index}`));
		$.append($$anchor, div_1);
	});

	$.delegated('click', button, () => items.unshift({ t: items.length }));
	$.delegated('click', button_1, () => items.at(-1).t = 10);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);