import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';

export default function Outer($$anchor) {
	$.event('click', $.window, () => console.log('window'));
	$.event('click', $.document, () => console.log('document'));
	$.event('click', $.document.body, () => console.log('body'));
	Inner($$anchor, {});
}