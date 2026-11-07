import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>update</button> <p> </p>`, 1);

export default function Main($$anchor) {
	let a = $.state("0");
	let b = $.state("0");
	let c = $.state("0");
	let d = $.state("0");

	function update() {
		// @ts-expect-error
		console.log($.update(a));

		// @ts-expect-error
		console.log($.update(b, -1));

		// @ts-expect-error
		console.log($.update_pre(c));

		// @ts-expect-error
		console.log($.update_pre(d, -1));
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ''}, ${$.get(b) ?? ''}, ${$.get(c) ?? ''}, ${$.get(d) ?? ''}`));
	$.delegated('click', button, update);
	$.append($$anchor, fragment);
}

$.delegate(['click']);