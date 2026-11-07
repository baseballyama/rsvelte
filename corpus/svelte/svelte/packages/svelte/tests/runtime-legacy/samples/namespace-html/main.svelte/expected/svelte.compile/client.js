import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<svg viewbox="0 0 100 100" id="one"><text textlength="100">hellooooo</text></svg> <math><mrow></mrow></math> <div class="hi">hi</div>`, 1);

export default function Main($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}