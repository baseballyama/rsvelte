import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<button>increment</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const count = writable(0);
	let ran = 0;

	$.user_effect(() => {
		$count();
		console.log(++ran);
	});

	var button = root();

	$.event('click', button, () => $.update_store(count, $count()));
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}