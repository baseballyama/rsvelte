import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);

var root_1 = $.from_html(`<section><h2>first</h2></section>`);

var root_2 = $.from_html(`<ul></ul> <!>`, 1);

export default function Attach_each($$anchor) {
	let items = $.proxy([{ id: 1, label: 'a' }, { id: 2, label: 'b' }]);
	function highlight(item) {
		return (node) => {
			node.dataset.label = item.label;
		};
	}
	var fragment = root_2();
	var ul = $.first_child(fragment);
	$.each(ul, 21, () => items, (item) => item.id, ($$anchor, item) => {
		var li = root();
		var text = $.only_child(li, true);
		$.attach(li, () => highlight($.get(item)));
		$.template_effect(() => $.set_text(text, $.get(item).label));
		$.append($$anchor, li);
	});
	$.reset(ul);
	var node_1 = $.sibling(ul, 2);
	{
		var consequent = ($$anchor) => {
			var section = root_1();
			var h2 = $.child(section);
			$.attach(h2, () => highlight(items[0]));
			$.reset(section);
			$.append($$anchor, section);
		};
		$.if(node_1, ($$render) => {
			if (items.length > 1) $$render(consequent);
		});
	}
	$.append($$anchor, fragment);
}
