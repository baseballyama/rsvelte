import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 16V4m9 0v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path><path d="m12 11-5 5-5-5m11-4 3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);

export default function PriorityDownIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}