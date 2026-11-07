import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Main($$anchor) {
	let props = { value: 'bar', form: 'qux', list: 'quu' };
	var input = root();

	$.attribute_effect(input, () => ({ ...props }), void 0, void 0, void 0, void 0, true);
	$.append($$anchor, input);
}