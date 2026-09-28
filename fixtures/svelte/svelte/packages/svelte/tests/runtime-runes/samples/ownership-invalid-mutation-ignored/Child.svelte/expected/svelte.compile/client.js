import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button> <button></button> <button></button>`, 1);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get($$props.store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let test = $.prop($$props, 'test', 7);
	let der = $.derived(test);
	let state = $.proxy(test());
	var fragment = root();
	var button = $.first_child(fragment);

	var //svelte-ignore ownership_invalid_mutation
	//svelte-ignore ownership_invalid_mutation
	button_1 = $.sibling(button, 2);

	var //svelte-ignore ownership_invalid_mutation
	//svelte-ignore ownership_invalid_mutation
	button_2 = $.sibling(button_1, 2);

	var //svelte-ignore ownership_invalid_mutation
	//svelte-ignore ownership_invalid_mutation
	button_3 = $.sibling(button_2, 2);

	$.delegated('click', button, () => {
		//svelte-ignore ownership_invalid_mutation
		test().test = Math.random();

		//svelte-ignore ownership_invalid_mutation
		test().test++;
	});

	$.delegated('click', button_1, () => {
		//svelte-ignore ownership_invalid_mutation
		$.get(der).test = Math.random();

		//svelte-ignore ownership_invalid_mutation
		$.get(der).test++;
	});

	$.delegated('click', button_2, () => {
		//svelte-ignore ownership_invalid_mutation
		state.test = Math.random();

		//svelte-ignore ownership_invalid_mutation
		state.test++;
	});

	$.delegated('click', button_3, () => {
		//svelte-ignore ownership_invalid_mutation
		$.store_mutate($$props.store, $.untrack($store).test = Math.random(), $.untrack($store));

		//svelte-ignore ownership_invalid_mutation
		$.store_mutate($$props.store, $.untrack($store).test++, $.untrack($store));
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);