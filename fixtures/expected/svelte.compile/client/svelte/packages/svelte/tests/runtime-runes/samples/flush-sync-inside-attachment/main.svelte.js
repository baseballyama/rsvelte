import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flushSync, mount } from 'svelte';
import Child from './Child.svelte';

var root = $.from_html(`<button>show</button> <div></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);

	$.attach(div, () => (target) => {
		mount(Child, { target, props: { text: 'hello' } });
		flushSync();
	});

	$.delegated('click', button, () => $.set(show, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);