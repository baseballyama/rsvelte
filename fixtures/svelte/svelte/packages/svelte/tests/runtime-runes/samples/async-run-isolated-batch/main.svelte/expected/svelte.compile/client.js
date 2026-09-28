import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

const queued = [];

export function push(v) {
	return new Promise((fulfil) => {
		queued.push(() => fulfil(v));
	});
}

var root = $.from_html(`<!> <button>show</button> <button>resolve</button> <button> </button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(false);
	let count = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Child($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var text = $.only_child(button_2, true);

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, () => $.set(show, true));
	$.delegated('click', button_1, () => queued.shift()?.());
	$.delegated('click', button_2, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);