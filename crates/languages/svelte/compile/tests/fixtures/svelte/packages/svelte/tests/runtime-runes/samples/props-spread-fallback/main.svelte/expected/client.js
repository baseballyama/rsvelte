import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<button>change propA</button> <button>change propB</button> <!>`, 1);

export default function Main($$anchor) {
	let props = $.proxy({ propA: true, propB: undefined });
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	Component(node, $.spread_props(() => props));

	$.event('click', button, () => {
		props.propA = !props.propA;
	});

	$.event('click', button_1, () => {
		props.propB = props.propB ? undefined : 'defined';
	});

	$.append($$anchor, fragment);
}