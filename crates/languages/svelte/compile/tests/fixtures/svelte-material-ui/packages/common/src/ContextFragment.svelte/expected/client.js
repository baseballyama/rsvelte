import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, setContext } from 'svelte';
import { writable } from 'svelte/store';

export default function ContextFragment($$anchor, $$props) {
	$.push($$props, true);

	const $storeValue = () => $.store_get(storeValue, '$storeValue', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// svelte-ignore state_referenced_locally
	const storeValue = writable($$props.value);

	// svelte-ignore state_referenced_locally
	setContext($$props.key, storeValue);

	$.user_effect(() => {
		$.store_set(storeValue, $$props.value);
	});

	onDestroy(() => {
		storeValue.set(undefined);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}