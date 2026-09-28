import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	$.event('visibilitychange', $.document, handleVisibilityChange);
	$.action($.document, ($$node) => someAction?.($$node));
}