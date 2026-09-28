import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg data-testid="custom-success-icon" viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="8" fill="currentColor"></circle></svg>`);

export default function CustomIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}