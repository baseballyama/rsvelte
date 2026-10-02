import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Output($$anchor) {
	$.event('mousemove', $.document.body, handleMousemove);
}