import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from "./B.svelte";
import B from "./A.svelte";

var root = $.from_html(`<button>click</button> <svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function Main($$anchor) {
	let value = $.state(0);
	let Comp = $.derived(() => $.get(value) % 2 === 0 ? A : B);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		$.css_props(node, () => ({ '--prop': 'red' }));

		$.component(node.lastChild, () => $.get(Comp), ($$anchor, Comp_1) => {
			Comp_1($$anchor, {});
		});

		$.reset(node);
	}

	$.delegated('click', button, () => $.update(value));
	$.append($$anchor, fragment);
}

$.delegate(['click']);