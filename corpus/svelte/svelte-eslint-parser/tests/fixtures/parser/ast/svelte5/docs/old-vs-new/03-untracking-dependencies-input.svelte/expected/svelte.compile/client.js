import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';

var root = $.from_html(`<button>a++</button> <button>b++</button> <p> </p>`, 1);

export default function _3_untracking_dependencies_input($$anchor, $$props) {
	$.push($$props, true);

	let a = $.state(0);
	let b = $.state(0);
	let sum = $.derived(add);

	function add() {
		return $.get(a) + untrack(() => $.get(b));
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var p = $.sibling(button_1, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ''} + ${$.get(b) ?? ''} = ${$.get(sum) ?? ''}`));
	$.event('click', button, () => $.update(a));
	$.event('click', button_1, () => $.update(b));
	$.append($$anchor, fragment);
	$.pop();
}