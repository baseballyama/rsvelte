import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="SHOUTY">YELL</div> <svg viewbox="0 0 100 100" id="one"><text textlength="100">hellooooo</text></svg> <svg viewBox="0 0 100 100" id="two"><text textLength="100">hellooooo</text></svg>`, 1);

export default function Main($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}