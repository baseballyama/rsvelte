import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as _ from 'lodash-es';

var root = $.from_html(`<div class="link"><div class="message">Enter URL</div> <form><input type="url"/></form></div>`);

export default function LinkModal($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 23, () => ({}));
	var div = root();
	var form = $.sibling($.child(div), 2);
	var input = $.child(form);

	$.remove_input_defaults(input);
	$.autofocus(input, true);
	$.reset(form);
	$.reset(div);

	$.event('submit', form, (event) => {
		event.preventDefault();
		$$props.onsave(value());
	});

	$.bind_value(input, value);
	$.append($$anchor, div);
	$.pop();
}