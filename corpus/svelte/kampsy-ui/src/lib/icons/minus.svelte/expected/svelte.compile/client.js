import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg data-testid="geist-icon" height="100%" stroke-linejoin="round" viewBox="0 0 16 16" width="100%" style="color: currentcolor;"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 7.25H2.75H13.25H14V8.75H13.25H2.75H2V7.25Z" fill="currentColor"></path></svg>`);

export default function Minus($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}