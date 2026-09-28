import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { prerendered, get_count, set_count, set_count_form } from './count.remote.js';

var root = $.from_html(`<p id="count"> </p> <button>get count</button> <button id="reset-btn">reset</button> <form><input/> <button>submit</button></form> <button id="fetch-prerendered">get prerendered</button> <p id="prerendered"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(null);
	let prerendered_result = $.state(null);
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var button = $.sibling(p, 2);
	var button_1 = $.sibling(button, 2);
	var form = $.sibling(button_1, 2);

	$.attribute_effect(form, ($0) => ({ ...$0 }), [
		() => set_count_form.enhance(async ({ submit }) => {
			await submit();
			$.set(count, await get_count(), true);
		})
	]);

	var input = $.child(form);

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => set_count_form.fields.count.as('text')], void 0, void 0, void 0, true);
	$.next(2);
	$.reset(form);

	var button_2 = $.sibling(form, 2);
	var p_1 = $.sibling(button_2, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(() => {
		$.set_text(text, $.get(count));
		$.set_text(text_1, $.get(prerendered_result));
	});

	$.delegated('click', button, async () => $.set(count, await get_count(), true));
	$.delegated('click', button_1, async () => $.set(count, await set_count(0), true));
	$.delegated('click', button_2, async () => $.set(prerendered_result, await prerendered(), true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);