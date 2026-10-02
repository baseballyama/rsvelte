import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _2_input($$anchor) {
	$.event('visibilitychange', $.document, handleVisibilityChange);
	$.action($.document, ($$node) => someAction?.($$node));
}