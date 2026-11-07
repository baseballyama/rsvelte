import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { obj } from "./Data.svelte.js";

var root = $.from_html(`<button>Replace</button> `, 1);

export default function Main($$anchor) {
	function replaceProp() {
		Object.assign(obj, { a: 9, b: 10, c: 11 });
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);

	$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => Object.values(obj)]);
	$.delegated('click', button, replaceProp);
	$.append($$anchor, fragment);
}

$.delegate(['click']);