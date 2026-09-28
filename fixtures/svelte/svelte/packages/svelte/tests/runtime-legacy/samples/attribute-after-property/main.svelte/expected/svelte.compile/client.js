import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <button>change step</button>`, 1);

export default function Main($$anchor) {
	let step = "any";
	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(input, () => ({ type: 'range', ...{ step } }), void 0, void 0, void 0, void 0, true);

	var button = $.sibling(input, 2);

	$.delegated('click', button, () => step = step === "any" ? 10 : "any");
	$.append($$anchor, fragment);
}

$.delegate(['click']);