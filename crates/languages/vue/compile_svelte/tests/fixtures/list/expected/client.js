import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { renderList, toDisplayString } from 'vue';

var root = $.from_html(`<li> </li>`);

var root_1 = $.from_html(`<p>empty</p>`);

var root_2 = $.from_html(`<ul></ul><!><button class="add">add</button><button class="remove">remove first</button>`, 1);

export default function List_vue($$anchor, $$props) {
	$.push($$props, true);
	let items = $.proxy([{ id: 1, name: 'apple' }, { id: 2, name: 'banana' }]);
	let next = 3;
	function add() {
		items.push({ id: next, name: `item ${next}` });
		next++;
	}
	function removeFirst() {
		items.shift();
	}
	var fragment = root_2();
	var ul = $.first_child(fragment);
	$.each(ul, 21, () => renderList(items, (value_1, key) => [value_1, key]), (entry) => entry[0].id, ($$anchor, entry) => {
		var li = root();
		var text = $.only_child(li);
		$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''}. ${$1 ?? ''}`), [() => toDisplayString($.get(entry)[1] + 1), () => toDisplayString($.get(entry)[0].name)]);
		$.append($$anchor, li);
	});
	$.reset(ul);
	var node = $.sibling(ul);
	{
		var consequent = ($$anchor) => {
			var p = root_1();
			$.append($$anchor, p);
		};
		$.if(node, ($$render) => {
			if (items.length === 0) $$render(consequent);
		});
	}
	var button = $.sibling(node);
	var button_1 = $.sibling(button);
	$.delegated('click', button, add);
	$.delegated('click', button_1, removeFirst);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
