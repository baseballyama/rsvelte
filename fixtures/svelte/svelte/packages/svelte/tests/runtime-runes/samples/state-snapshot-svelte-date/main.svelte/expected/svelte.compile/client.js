import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteDate } from 'svelte/reactivity';

var root = $.from_html(`<button>update</button> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const date = new SvelteDate(0);
	const snapshot = $.derived(() => $.snapshot(date));
	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => $.get(snapshot).toISOString()]);
	$.delegated('click', button, () => date.setTime(86400000));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);