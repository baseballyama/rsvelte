import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HeadNested from './HeadNested.svelte';

export default function Main($$anchor) {
	$.head('l53v48', ($$anchor) => {
		HeadNested($$anchor, {});
	});
}