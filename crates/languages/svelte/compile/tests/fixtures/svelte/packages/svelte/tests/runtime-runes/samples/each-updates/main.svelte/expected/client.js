import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!> <button>add</button> <button>change</button> <button>reload</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let data = $.state($.proxy({ items: [] }));

	function fetchData() {
		$.set(
			data,
			{
				items: [
					{ id: 1, price: 1, name: 'test' },
					{ id: 2, price: 2, name: 'test 2' }
				]
			},
			true
		);
	}

	fetchData();

	function copyItems(original) {
		return [...original.map((item) => ({ ...item }))];
	}

	let items = $.state(void 0);

	$.user_effect(() => {
		$.set(items, copyItems($.get(data).items), true);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $.get(items), $.index, ($$anchor, item) => {
		var p = root();
		var text = $.only_child(p);

		$.template_effect(() => $.set_text(text, `${$.get(item).name ?? ''} costs $${$.get(item).price ?? ''}`));
		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => $.get(items), (item) => item.id, ($$anchor, item) => {
		var p_1 = root();
		var text_1 = $.only_child(p_1);

		$.template_effect(() => $.set_text(text_1, `${$.get(item).name ?? ''} costs $${$.get(item).price ?? ''}`));
		$.append($$anchor, p_1);
	});

	var button = $.sibling(node_1, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.delegated('click', button, () => {
		$.get(items).push({ id: 3, price: 3, name: 'test 3' });
	});

	$.delegated('click', button_1, () => {
		$.get(data).items[1].price = 2000;
	});

	$.delegated('click', button_2, () => {
		fetchData();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);