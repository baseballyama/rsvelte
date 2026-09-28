import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const renderItem = ($$anchor, item = $.noop) => {
	var li = root_1();
	var text = $.child(li);
	var node = $.sibling(text);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.template_effect(() => $.set_style(span, `background-color: ${item().color ?? ''}; width: 20px; height: 20px; display: inline-block;`));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (item().color) $$render(consequent);
		});
	}

	$.reset(li);
	$.template_effect(() => $.set_text(text, `${item().name ?? ''} (${item().id ?? ''}) `));
	$.append($$anchor, li);
};

var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<li> <!></li>`);
var root_2 = $.from_html(`<ul></ul> <button>Swap items 1 & 3</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const items = $.proxy([
		{ name: 'test', id: 1, color: 'red' },
		{ name: 'test 2', id: 2 },
		{ name: 'test 3', id: 3 }
	]);

	const onclick = () => {
		const from = 0;
		const to = 2;

		items.splice(to, 0, items.splice(from, 1)[0]);
	};

	var fragment = root_2();
	var ul = $.first_child(fragment);

	$.each(ul, 21, () => items, (item) => item.id, ($$anchor, item) => {
		renderItem($$anchor, () => $.get(item));
	});

	$.reset(ul);

	var button = $.sibling(ul, 2);

	$.delegated('click', button, onclick);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);