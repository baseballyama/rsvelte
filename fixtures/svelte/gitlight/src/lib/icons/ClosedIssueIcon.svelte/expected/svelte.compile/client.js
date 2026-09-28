import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="7.25" stroke="#7E858F" stroke-width="1.5"></circle><path d="m12.828 7.172-5.656 5.656" stroke="#7E858F" stroke-width="1.5" stroke-linecap="round"></path></svg>`);

export default function ClosedIssueIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}