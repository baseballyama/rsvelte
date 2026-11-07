import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);
var root_1 = $.from_html(`<button class="del">delete</button> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {string} */
	let status;

	function del() {
		fetch('delete-route/42.json', { method: 'DELETE' }).then((r) => r.json()).then(({ id }) => status = `deleted ${id}`, (e) => status = e.toString());
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var h1 = root();
			var text = $.only_child(h1, true);

			$.template_effect(() => $.set_text(text, status));
			$.append($$anchor, h1);
		};

		$.if(node, ($$render) => {
			if (status) $$render(consequent);
		});
	}

	$.delegated('click', button, del);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);