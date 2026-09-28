import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { render } from 'svelte/server';
import ChildComponent from './ChildComponent.svelte';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	setContext('foo', true);

	const content = render(ChildComponent, { props: {}, context: new Map() }).html;
	var div = root();

	$.html(div, () => content, true);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}