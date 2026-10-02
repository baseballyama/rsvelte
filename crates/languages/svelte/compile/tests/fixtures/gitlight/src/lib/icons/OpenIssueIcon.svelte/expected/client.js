import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="7.25" stroke="#64B75D" stroke-width="1.5"></circle><circle cx="10" cy="10" r="1.5" fill="#64B75D"></circle></svg>`);

export default function OpenIssueIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}