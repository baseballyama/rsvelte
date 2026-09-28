import * as $ from 'svelte/internal/server';
import { intersect } from '@svelte-put/intersect';

export default function Quick_start($$renderer) {
	// :::highlight
	// :::
	function onIntersect(e) {
		const { observer, entries, direction } = e.detail;

		console.log('the observer itself', observer);
		console.log('scrolling direction:', direction);
		console.log('intersecting:', entries[0]?.isIntersecting ? 'entering' : 'leaving');
	}

	$$renderer.push(`<div>...</div>`);
}