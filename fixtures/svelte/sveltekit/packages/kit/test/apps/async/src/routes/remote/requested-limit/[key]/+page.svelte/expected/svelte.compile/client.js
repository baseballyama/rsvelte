import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { bump, get_count } from './data.remote';

var root = $.from_html(`<div id="value"> </div> <div id="error"> </div> <button>bump</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const q = $.derived(() => get_count($$props.params.key));
	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var button = $.sibling(div_1, 2);

	$.template_effect(() => {
		$.set_text(text, $.get(q).current ?? 'unset');

		$.set_text(text_1, $.get(q).error
			? `${$.get(q).error.status}: ${$.get(q).error.message}`
			: 'none');
	});

	$.delegated('click', button, () => bump($$props.params.key).updates($.get(q)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);