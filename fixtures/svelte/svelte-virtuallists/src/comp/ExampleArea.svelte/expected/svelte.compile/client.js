import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Highlighted from './Highlighted.svelte';

var root = $.from_html(`<div><!> <!></div>`);

export default function ExampleArea($$anchor, $$props) {
	$.push($$props, true);

	//@ts-ignore
	const Comp = $$props.example.component;

	var div = root();
	var node = $.child(div);

	Comp(node, {});

	var node_1 = $.sibling(node, 2);

	Highlighted(node_1, {
		lang: 'svelte',
		get highlighted() {
			return $$props.example.highlightedHTML;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}