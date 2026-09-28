import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Foo } from '#lib';

var root = $.from_html(`<button data-id="shallow">add state</button> <button data-id="full">add state with navigation</button> <button>bump count</button> <p data-testid="foo"> </p> <p data-testid="count"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var p = $.sibling(button_2, 2);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);

	$.template_effect(
		($0) => {
			$.set_text(text, `foo: ${$0 ?? ''}`);
			$.set_text(text_1, `count: ${page.state.count ?? 'nope' ?? ''}`);
		},
		[() => page.state.foo?.bar() ?? 'nope']
	);

	$.delegated('click', button, () => {
		const state = $.proxy({ foo: new Foo('it works?'), count: 0 });

		void goto('', { shallow: true, state });
	});

	$.delegated('click', button_1, () => {
		const state = $.proxy({ foo: new Foo('it works?'), count: 0 });

		void goto('', { state });
	});

	$.delegated('click', button_2, () => page.state.count = (page.state.count ?? 0) + 1);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);