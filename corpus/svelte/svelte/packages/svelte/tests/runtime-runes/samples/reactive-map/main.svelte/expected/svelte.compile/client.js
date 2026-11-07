import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteMap } from 'svelte/reactivity';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<button>set if</button> <button>set if 1</button> <button>add</button> <button>delete</button> <button>clear</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let state = new SvelteMap([[0, 0]]);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);
	var node = $.sibling(button_4, 2);

	$.each(node, 17, () => state, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let key = () => $.get($$array)[0];
		let value = () => $.get($$array)[1];
		var div = root();
		var text = $.only_child(div);

		$.template_effect(() => $.set_text(text, `${key() ?? ''}:${value() ?? ''}`));
		$.append($$anchor, div);
	});

	$.delegated('click', button, () => {
		if (state.has(0)) {
			state.set(0, 1);
		}
	});

	$.delegated('click', button_1, () => {
		if (state.get(0) === 1) {
			state.set(0, 0);
		}
	});

	$.delegated('click', button_2, () => {
		state.set(state.size + 1, state.size + 1);
	});

	$.delegated('click', button_3, () => {
		state.delete(state.size);
	});

	$.delegated('click', button_4, () => {
		state.clear();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);