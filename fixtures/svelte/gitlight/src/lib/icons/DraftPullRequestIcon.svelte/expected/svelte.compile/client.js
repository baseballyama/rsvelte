import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="2" stroke="#7E858F" stroke-width="1.5"></circle><path d="M5 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V7m12 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" stroke="#7E858F" stroke-width="1.5"></path><circle cx="15" cy="9" r="1" fill="#7E858F"></circle><circle cx="15" cy="5" r="1" fill="#7E858F"></circle></svg>`);

export default function DraftPullRequestIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}