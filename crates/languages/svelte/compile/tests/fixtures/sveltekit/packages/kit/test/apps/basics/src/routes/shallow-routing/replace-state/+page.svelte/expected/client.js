import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { page } from '$app/state';

var root = $.from_html(`<h1>parent</h1> <button data-id="one">replace state on current page</button> <button data-id="two">shallow navigate and replace</button> <button data-id="end-shallow">end shallow</button> <button data-id="state-only">persist state only</button> <p> </p> <span data-id="shallow"> </span>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	async function one() {
		await goto('', { shallow: true, replace: true, state: { active: true } });
	}

	async function two() {
		await goto('/shallow-routing/replace-state/a', { replace: true, shallow: true, state: { active: true } });
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
		$.set_text(text_1, page.shallow ? page.shallow.url.pathname : 'null');
	});

	$.delegated('click', button, one);
	$.delegated('click', button_1, two);
	$.delegated('click', button_2, () => goto('/shallow-routing/replace-state', { replace: true, state: { active: true } }));

	$.delegated('click', button_3, () => goto('', {
		shallow: true,
		replace: true,
		state: { active: true },
		persistState: true
	}));

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);