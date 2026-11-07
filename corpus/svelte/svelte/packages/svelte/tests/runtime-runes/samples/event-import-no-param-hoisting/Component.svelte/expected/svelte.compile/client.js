import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { num } from './state.svelte.js';

var root = $.from_html(`<button>click</button>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	function onclick() {
		$$props.foo();
		console.log(num);
	}

	var button = root();

	$.delegated('click', button, onclick);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);