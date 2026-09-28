import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get_data } from './data.remote.js';

var root = $.from_html(`<p id="status"> </p>`);
var root_1 = $.from_html(`<p id="value"> </p>`);
var root_2 = $.from_html(`<button id="deny-btn">Deny and refresh</button> <button id="clear-btn">Clear cookie</button> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const result = get_data();
	var fragment = root_2();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, result.error.status));
			$.append($$anchor, p);
		};

		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, result.current));
			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if (result.error) $$render(consequent); else if (result.current !== undefined) $$render(consequent_1, 1);
		});
	}

	$.delegated('click', button, () => {
		document.cookie = 'deny-remote=1; path=/';
		result.refresh();
	});

	$.delegated('click', button_1, () => {
		document.cookie = 'deny-remote=0; path=/; max-age=0';
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);