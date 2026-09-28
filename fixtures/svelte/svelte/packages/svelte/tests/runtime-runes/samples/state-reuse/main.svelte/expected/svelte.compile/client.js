import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let foo = { value: 'a' };
	let state1 = $.state($.proxy(foo));
	let state2 = $.state($.proxy(foo));
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `state1.value: ${// This contains Symbol.$state and Symbol.$readonly and we can't do anything against it,
	// because it's called on the original object, not our state proxy
	// $.proxy will see that Symbol.$state exists on this object already, which shouldn't result in a stale value
	// $.proxy can't look into Symbol.$state because of the frozen object
	$.get(state1).value ?? ''}
state2.value: ${$.get(state2).value ?? ''}`));

	$.delegated('click', button, () => {
		let new_state1 = {};
		let new_state2 = {};

		// This contains Symbol.$state and Symbol.$readonly and we can't do anything against it,
		// because it's called on the original object, not our state proxy
		Reflect.ownKeys(foo).forEach((k) => {
			new_state1[k] = foo[k];
			new_state2[k] = foo[k];
		});

		new_state1.value = 'b';
		new_state2.value = 'b';

		// $.proxy will see that Symbol.$state exists on this object already, which shouldn't result in a stale value
		$.set(state1, new_state1, true);

		// $.proxy can't look into Symbol.$state because of the frozen object
		$.set(state2, Object.freeze(new_state2), true);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);