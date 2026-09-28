import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickoutside } from '@svelte-put/clickoutside';

var root = $.from_html(`<div>...</div>`);

export default function Quick_start($$anchor) {
	function doSomething(e) {
		console.log(e.target);
	}

	var div = root();

	$.action(div, ($$node) => clickoutside?.($$node));
	$.event('clickoutside', div, doSomething);
	$.append($$anchor, div);
}