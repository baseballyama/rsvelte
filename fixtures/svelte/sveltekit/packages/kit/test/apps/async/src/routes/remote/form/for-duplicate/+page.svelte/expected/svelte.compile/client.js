import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { get_count, increment } from './form.remote.ts';

var root = $.from_html(`<p id="count"> </p> <form><button type="submit" id="submit">Submit</button></form>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const count = get_count();
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var form = $.sibling(p, 2);

	$.attribute_effect(form, ($0) => ({ ...$0 }), [
		() => increment.for((count.current || 1) && 'a').enhance(async ({ submit }) => {
			await submit();
		})
	]);

	$.template_effect(() => $.set_text(text, count.current));
	$.append($$anchor, fragment);
	$.pop();
}