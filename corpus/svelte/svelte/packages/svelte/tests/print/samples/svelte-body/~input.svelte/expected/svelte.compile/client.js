import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	$.event('mousemove', $.document.body, handleMousemove);
}