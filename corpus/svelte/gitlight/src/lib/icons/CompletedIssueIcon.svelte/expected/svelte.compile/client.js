import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="7.25" stroke="#9C73EF" stroke-width="1.5"></circle><path d="m13 8-4.071 4L7 10.105" stroke="#9C73EF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);

export default function CompletedIssueIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}