import * as $ from 'svelte/internal/server';
import HeadNested from './HeadNested.svelte';

export default function Main($$renderer) {
	$.head('l53v48', $$renderer, ($$renderer) => {
		HeadNested($$renderer, {});
	});
}