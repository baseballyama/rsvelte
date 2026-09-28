import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext, mount } from 'svelte';
import ChildComponent from './ChildComponent.svelte';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	setContext('foo', true);

	function render(node) {
		mount(ChildComponent, { target: node, context: new Map() });
	}

	var div = root();

	$.action(div, ($$node) => render?.($$node));
	$.append($$anchor, div);
	$.pop();
}