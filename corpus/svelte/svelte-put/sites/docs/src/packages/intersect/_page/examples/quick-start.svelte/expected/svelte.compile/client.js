import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { intersect } from '@svelte-put/intersect';

var root = $.from_html(`<div>...</div>`);

export default function Quick_start($$anchor) {
	// :::highlight
	// :::
	function onIntersect(e) {
		const { observer, entries, direction } = e.detail;

		console.log('the observer itself', observer);
		console.log('scrolling direction:', direction);
		console.log('intersecting:', entries[0]?.isIntersecting ? 'entering' : 'leaving');
	}

	var div = root();

	$.action(div, ($$node) => intersect?.($$node));
	$.event('intersect', div, onIntersect);
	$.append($$anchor, div);
}