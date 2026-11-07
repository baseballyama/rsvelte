import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto, refreshAll } from '$app/navigation';
import { page } from '$app/state';

var root = $.from_html(`<h1>parent</h1> <button data-id="one">add state on current page</button> <button data-id="two">shallow navigate to child page</button> <button data-id="params">shallow navigate to parameterized page</button> <button data-id="cancel">cancel</button> <button data-id="state-only">state only</button> <button data-id="state-only-persist">persist state only</button> <button data-id="shallow-persist">persist shallow state</button> <button data-id="goto-state">goto with state</button> <button data-id="goto-persist">persist goto state</button> <button data-id="end-shallow">end shallow</button> <button data-id="refresh">refresh all</button> <div style="position: fixed; right: 0; bottom: 0"><input data-id="options-focus" aria-label="focus target"/> <button data-id="options-default">default options</button> <button data-id="options-false">disabled options</button></div> <p> </p> <span data-id="shallow"> </span> <span data-id="resolved"> </span> <span data-id="now"> </span> <div style="height: 2000px"></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {string | null} */
	let resolved = $.state(null);

	function one() {
		void goto('', { shallow: true, state: { active: true } });
	}

	function two() {
		void goto('/shallow-routing/push-state/a', { state: { active: true }, shallow: true });
	}

	async function params() {
		await goto('/shallow-routing/push-state/hello', { state: { active: true }, shallow: true });
		$.set(resolved, document.querySelector('p')?.textContent ?? null, true);
	}

	var fragment = root();
	var button = $.sibling($.first_child(fragment), 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);
	var button_5 = $.sibling(button_4, 2);
	var button_6 = $.sibling(button_5, 2);
	var button_7 = $.sibling(button_6, 2);
	var button_8 = $.sibling(button_7, 2);
	var button_9 = $.sibling(button_8, 2);
	var button_10 = $.sibling(button_9, 2);
	var div = $.sibling(button_10, 2);
	var button_11 = $.sibling($.child(div), 2);
	var button_12 = $.sibling(button_11, 2);

	$.reset(div);

	var p = $.sibling(div, 2);
	var text = $.only_child(p);
	var span = $.sibling(p, 2);
	var text_1 = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_2 = $.only_child(span_1, true);
	var span_2 = $.sibling(span_1, 2);
	var text_3 = $.only_child(span_2, true);

	$.next(2);

	$.template_effect(
		($0) => {
			$.set_text(text, `active: ${page.state.active ?? false ?? ''}`);
			$.set_text(text_1, $0);
			$.set_text(text_2, $.get(resolved));
			$.set_text(text_3, $$props.data.now);
		},
		[
			() => page.shallow
				? `${page.shallow.url.pathname} ${page.shallow.route?.id ?? 'null'} ${JSON.stringify(page.shallow.params)}`
				: 'null'
		]
	);

	$.delegated('click', button, one);
	$.delegated('click', button_1, two);
	$.delegated('click', button_2, params);
	$.delegated('click', button_3, () => goto('?cancel', { shallow: true, state: { active: true } }));
	$.delegated('click', button_4, () => goto('', { shallow: true, state: { active: true } }));
	$.delegated('click', button_5, () => goto('', { shallow: true, state: { active: true }, persistState: true }));
	$.delegated('click', button_6, () => goto('/shallow-routing/push-state/a', { shallow: true, state: { active: true }, persistState: true }));
	$.delegated('click', button_7, () => goto('/shallow-routing/push-state', { state: { active: true } }));
	$.delegated('click', button_8, () => goto('/shallow-routing/push-state', { state: { active: true }, persistState: true }));
	$.delegated('click', button_9, () => goto('/shallow-routing/push-state', { state: { active: true } }));

	$.delegated('click', button_10, function (...$$args) {
		refreshAll?.apply(this, $$args);
	});

	$.delegated('click', button_11, () => goto('?options=default', { shallow: true }));
	$.delegated('click', button_12, () => goto('?options=false', { shallow: true, reset: true }));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);