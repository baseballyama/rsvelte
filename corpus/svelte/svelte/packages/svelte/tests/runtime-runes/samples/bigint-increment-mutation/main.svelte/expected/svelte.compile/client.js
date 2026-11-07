import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>mutate</button> <button>reassign</button> <p> </p>`, 1);

export default function Main($$anchor) {
	let object = $.state($.proxy({ n: 0n }));

	function reassign() {
		$.set(object, { n: 0n }, true);
	}

	function mutate() {
		return $.get(object).n++;
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var p = $.sibling(button_1, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(object).n));
	$.delegated('click', button, mutate);
	$.delegated('click', button_1, reassign);
	$.append($$anchor, fragment);
}

$.delegate(['click']);