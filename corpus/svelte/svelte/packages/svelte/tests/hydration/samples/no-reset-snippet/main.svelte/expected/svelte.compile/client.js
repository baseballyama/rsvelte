import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><span>something</span></div>`);

export default function Main($$anchor) {
	var div = root();

	{
		const test = ($$anchor) => {};
	}

	$.append($$anchor, div);
}