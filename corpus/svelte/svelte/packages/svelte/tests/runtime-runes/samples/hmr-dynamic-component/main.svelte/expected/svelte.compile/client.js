import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

var root = $.from_html(`<button>show</button> <!>`, 1);

export default function Main($$anchor) {
	let C = $.state(null);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.component(node, () => $.get(C), ($$anchor, C_1) => {
		C_1($$anchor, {});
	});

	$.delegated('click', button, () => $.set(C, Component, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);