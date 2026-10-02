import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { set_message } from './form.remote.ts';

var root = $.from_html(`<label><input type="checkbox" data-should-submit=""/> should submit</label> <form><button>submit</button></form> <p data-pending=""> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let should_submit = $.state(false);
	const pendings_arr = [];

	const pendings = $.derived(() => {
		pendings_arr.push(set_message.pending);

		return pendings_arr.join(', ');
	});

	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var form = $.sibling(label, 2);

	$.attribute_effect(form, ($0) => ({ ...$0 }), [
		() => set_message.enhance(async ({ submit }) => {
			if (!$.get(should_submit)) return;

			await submit();
		})
	]);

	var p = $.sibling(form, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(pendings)));
	$.bind_checked(input, () => $.get(should_submit), ($$value) => $.set(should_submit, $$value));
	$.append($$anchor, fragment);
	$.pop();
}