import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-ik6lfs">someone could programmatically add a class to this, so having global be part of a modifier is necessary</div> <span class="x svelte-ik6lfs">-</span>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}