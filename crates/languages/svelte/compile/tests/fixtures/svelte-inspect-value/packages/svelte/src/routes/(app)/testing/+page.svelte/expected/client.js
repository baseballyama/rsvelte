import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { inspectElement } from '$lib/attachments/inspect-element.js';
import Inspect from '$lib/index.js';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<div class="flex row"><button>+</button> <button>-</button></div> <!> <!> <textarea style="resize: both; max-width: 320px">fififi</textarea> <input type="number" autocomplete="off"/> <div></div> <div contenteditable="">fafafaf</div> <ul></ul>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let array = $.state([]);
	let asdf = { [Symbol('bababa')]: 'hei' };
	let num = $.state(3);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);

	$.reset(div);

	var node = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({ array: $.get(array) }));

		Inspect(node, {
			get values() {
				return $.get($0);
			},
			expandLevel: 0
		});
	}

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Inspect.Values, ($$anchor, Inspect_Values) => {
		Inspect_Values($$anchor, $.spread_props(
			{
				get array() {
					return $.get(array);
				}
			},
			() => asdf
		));
	});

	var textarea = $.sibling(node_1, 2);

	$.attach(textarea, () => inspectElement('resize'));

	var input = $.sibling(textarea, 2);

	$.remove_input_defaults(input);
	$.attach(input, () => inspectElement('numberInput'));

	var div_1 = $.sibling(input, 2);

	$.attach(div_1, () => inspectElement('datadiv'));

	var div_2 = $.sibling(div_1, 2);

	$.attach(div_2, () => inspectElement('editable'));

	var ul = $.sibling(div_2, 2);

	$.each(ul, 20, () => $.get(array), (num) => num, ($$anchor, num, $$index, $$array) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, num));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.attach(ul, () => inspectElement('list'));
	$.template_effect(() => $.set_attribute(div_1, 'data-num', $.get(num)));
	$.delegated('click', button, () => $.set(array, [...$.get(array), $.get(array).length]));
	$.delegated('click', button_1, () => $.set(array, $.get(array).filter((n) => n !== $.get(array).length - 1)));
	$.bind_value(input, () => $.get(num), ($$value) => $.set(num, $$value));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);