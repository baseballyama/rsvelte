import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { box } from "$lib/box/box.svelte";
import { attachRef } from "$lib/utils/attach-ref.js";

var root = $.from_html(`<div>Hello world</div>`);
var root_1 = $.from_html(`<button>Toggle</button> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const ref = box(null);
	const props = { ...attachRef(ref) };

	$.user_effect(() => {
		console.log(ref.current);
	});

	let show = $.state(false);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...props }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(show, !$.get(show)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);