import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="8" width="3" height="6" rx="1"></rect><rect x="6" y="5" width="3" height="9" rx="1"></rect><rect x="11" y="2" width="3" height="12" rx="1"></rect></svg>`);

export default function Change_priority($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}