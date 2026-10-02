import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Wrapper1 from "./wrapper.svelte";
import Wrapper2 from "./wrapper2.svelte";

var root = $.from_html(`<button>inc</button> <!> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);

	let getter = $.derived(() => {
		const copy = $.get(count);

		return () => copy;
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Wrapper1(node, {
		get getter() {
			return $.get(getter);
		}
	});

	var node_1 = $.sibling(node, 2);

	Wrapper2(node_1, {
		get getter() {
			return $.get(getter);
		}
	});

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);