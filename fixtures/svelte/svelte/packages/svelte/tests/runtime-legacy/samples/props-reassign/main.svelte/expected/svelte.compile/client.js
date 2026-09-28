import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import App from './App.svelte';

var root = $.from_html(`<button>increment</button> <!>`, 1);

export default function Main($$anchor) {
	let a = 0;
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	App(node, {
		get a() {
			return a;
		}
	});

	$.event('click', button, () => a++);
	$.append($$anchor, fragment);
}