import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FlakyComponent from "./FlakyComponent.svelte";

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button></button> <!>`, 1);

export default function Main($$anchor) {
	let test = $.state(1);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		const failed = ($$anchor) => {
			const double = $.derived(() => $.get(test) * 2);
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(double)));
			$.append($$anchor, p);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			const double = $.derived(() => $.get(test) * 2);

			FlakyComponent($$anchor, {});
		});
	}

	$.delegated('click', button, () => $.update(test));
	$.append($$anchor, fragment);
}

$.delegate(['click']);