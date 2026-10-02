import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mount, unmount } from 'svelte';
import Component from './Component.svelte';

var root = $.from_html(`<div></div> <button>mount with intro transition</button> <button>mount without intro transition</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let el;
	let instance;

	function intro(animate) {
		if (instance) unmount(instance);

		instance = mount(Component, { target: el, intro: animate });
	}

	var fragment = root();
	var div = $.first_child(fragment);

	$.bind_this(div, ($$value) => el = $$value, () => el);

	var button = $.sibling(div, 2);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => intro());
	$.delegated('click', button_1, () => intro(false));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);