import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto, invalidate, invalidateAll, refreshAll } from '$app/navigation';
import { page } from '$app/state';

var root = $.from_html(`<h1>refresh</h1> <button data-id="activate">add state</button> <button data-id="refreshAll">refreshAll</button> <button data-id="invalidate">invalidate</button> <button data-id="invalidateAll">invalidateAll</button> <p> </p> <span> </span>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	function activate() {
		goto('', { shallow: true, state: { active: true } });
	}

	var fragment = root();
	var button = $.sibling($.first_child(fragment), 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var p = $.sibling(button_3, 2);
	var text = $.only_child(p);
	var span = $.sibling(p, 2);
	var text_1 = $.only_child(span, true);

	$.template_effect(() => {
		$.set_text(text, `active: ${page.state.active ?? false ?? ''}`);
		$.set_text(text_1, $$props.data.now);
	});

	$.delegated('click', button, activate);
	$.delegated('click', button_1, () => window.promise = refreshAll());
	$.delegated('click', button_2, () => window.promise = invalidate('refresh:now'));
	$.delegated('click', button_3, () => window.promise = invalidateAll());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);