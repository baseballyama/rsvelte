import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg width="18" height="18" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.375 0.0517578H11.625V11.3018H9.375V2.30176H6V11.3018H0.375V0.0517578Z" fill="currentColor"></path></svg>`);

export default function Npm($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}