import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $style = () => $.store_get(style, '$style', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let style = writable('world');

	$.user_effect(() => {
		console.log($style());
	});

	function init() {
		style = writable('svelte');
	}

	$.pop();
	$$cleanup();
}