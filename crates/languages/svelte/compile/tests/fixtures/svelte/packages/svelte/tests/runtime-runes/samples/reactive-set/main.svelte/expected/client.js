import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<button>delete initial</button> <button>add</button> <button>delete</button> <button>clear</button> <div id="output"><p> </p> <!></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let state = new SvelteSet([0]);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var div = $.sibling(button_3, 2);
	var p = $.child(div);
	var text = $.only_child(p, true);
	var node = $.sibling(p, 2);

	$.each(node, 17, () => state, $.index, ($$anchor, item) => {
		var div_1 = root();
		var text_1 = $.only_child(div_1, true);

		$.template_effect(() => $.set_text(text_1, $.get(item)));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.template_effect(() => $.set_text(text, state.size));
	$.delegated('click', button, () => state.delete(0));
	$.delegated('click', button_1, () => state.add(state.size + 1));
	$.delegated('click', button_2, () => state.delete(state.size));
	$.delegated('click', button_3, () => state.clear());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);