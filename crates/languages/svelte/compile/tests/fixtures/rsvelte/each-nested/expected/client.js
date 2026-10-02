import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);

var root_1 = $.from_html(`<h2> </h2> <ul></ul>`, 1);

export default function Each_nested($$anchor) {
	let groups = $.proxy([{ name: 'fruit', items: ['apple', 'pear'] }, { name: 'veg', items: ['leek'] }]);
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.each(node, 17, () => groups, $.index, ($$anchor, group) => {
		var fragment_1 = root_1();
		var h2 = $.first_child(fragment_1);
		var text = $.only_child(h2, true);
		var ul = $.sibling(h2, 2);
		$.each(ul, 21, () => $.get(group).items, $.index, ($$anchor, item) => {
			var li = root();
			var text_1 = $.only_child(li);
			$.template_effect(() => $.set_text(text_1, `${$.get(group).name ?? ''}: ${$.get(item) ?? ''}`));
			$.append($$anchor, li);
		});
		$.reset(ul);
		$.template_effect(() => $.set_text(text, $.get(group).name));
		$.append($$anchor, fragment_1);
	});
	$.append($$anchor, fragment);
}
