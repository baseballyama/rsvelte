import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<li>count = <span> </span></li>`);
var root_2 = $.from_html(`<button> </button> <button>undefined</button> <button>null</button> <button>empty</button> <button>[1,2,3]</button> <ul></ul>`, 1);

export default function Main($$anchor) {
	let list = $.state(void 0);
	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	var fragment = root_2();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);
	var ul = $.sibling(button_4, 2);

	$.each(
		ul,
		21,
		() => $.get(list),
		$.index,
		($$anchor, a) => {
			var li = root();
			var text_1 = $.only_child(li);

			$.template_effect(() => $.set_text(text_1, `item : ${$.get(a) ?? ''}`));
			$.append($$anchor, li);
		},
		($$anchor) => {
			var li_1 = root_1();
			var span = $.sibling($.child(li_1));
			var text_2 = $.only_child(span, true);

			$.reset(li_1);
			$.template_effect(() => $.set_text(text_2, $.get(count)));
			$.append($$anchor, li_1);
		}
	);

	$.reset(ul);
	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.delegated('click', button, increment);
	$.delegated('click', button_1, () => $.set(list, undefined));
	$.delegated('click', button_2, () => $.set(list, null));
	$.delegated('click', button_3, () => $.set(list, [], true));
	$.delegated('click', button_4, () => $.set(list, [1, 2, 3], true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);