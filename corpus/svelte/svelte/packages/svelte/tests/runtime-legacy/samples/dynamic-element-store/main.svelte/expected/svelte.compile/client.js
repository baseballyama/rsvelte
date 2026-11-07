import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $foo = () => $.store_get(foo, '$foo', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const foo = writable('div');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, $foo, false);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}