import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mount, unmount } from 'svelte';
import Inner from './inner.svelte';

var root = $.from_html(`<button>toggle</button> <div></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let el;
	let component;
	let props = $.proxy({ count: 0 });

	function toggle() {
		if (component) {
			unmount(component);
			component = null;
		} else {
			component = mount(Inner, {
				target: el,
				props,
				context: new Map([['multiply', 2]]),
				events: { update: (e) => props.count = e.detail }
			});
		}
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);

	$.bind_this(div, ($$value) => el = $$value, () => el);
	$.delegated('click', button, toggle);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);