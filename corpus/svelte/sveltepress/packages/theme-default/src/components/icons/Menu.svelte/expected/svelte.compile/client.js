import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36"><path fill="currentColor" d="M32 29H4a1 1 0 0 1 0-2h28a1 1 0 0 1 0 2Z" class="clr-i-outline clr-i-outline-path-1"></path><path fill="currentColor" d="M32 19H4a1 1 0 0 1 0-2h28a1 1 0 0 1 0 2Z" class="clr-i-outline clr-i-outline-path-2"></path><path fill="currentColor" d="M32 9H4a1 1 0 0 1 0-2h28a1 1 0 0 1 0 2Z" class="clr-i-outline clr-i-outline-path-3"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>`);

export default function Menu($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}