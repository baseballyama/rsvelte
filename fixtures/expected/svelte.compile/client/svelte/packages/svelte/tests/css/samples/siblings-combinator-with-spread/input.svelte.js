import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <div class="svelte-10t85l6">Should be red, when input is focused</div>`, 1);

export default function Input($$anchor) {
	const test = { placeholder: 'Text' };
	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(input, () => ({ ...test }), void 0, void 0, void 0, 'svelte-10t85l6', true);
	$.next(2);
	$.append($$anchor, fragment);
}