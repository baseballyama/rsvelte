import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

var root = $.from_html(`<button>Map</button> <button>Set</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let map = new SvelteMap();
	let set = new SvelteSet();

	;;
	;;

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => map.set('a', 'a'));
	$.delegated('click', button_1, () => set.add('a'));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);