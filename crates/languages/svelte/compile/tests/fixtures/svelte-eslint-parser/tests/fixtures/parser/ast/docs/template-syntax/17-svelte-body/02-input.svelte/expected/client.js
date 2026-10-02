import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _2_input($$anchor) {
	$.event('mouseenter', $.document.body, handleMouseenter);
	$.event('mouseleave', $.document.body, handleMouseleave);
}