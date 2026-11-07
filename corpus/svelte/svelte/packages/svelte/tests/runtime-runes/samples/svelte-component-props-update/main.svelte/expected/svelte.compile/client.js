import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Comp_1 from './Comp-1.svelte';
import Comp_2 from './Comp-2.svelte';

var root = $.from_html(`<button>Change</button> <!>`, 1);

export default function Main($$anchor) {
	let Comp = $.state(Comp_1);
	let data = $.state({ obj: { arr: [1, 2, 3] } });

	function change() {
		$.set(Comp, Comp_2);
		$.set(data, {});
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.component(node, () => $.get(Comp), ($$anchor, Comp_3) => {
		Comp_3($$anchor, {
			get data() {
				return $.get(data);
			}
		});
	});

	$.delegated('click', button, change);
	$.append($$anchor, fragment);
}

$.delegate(['click']);