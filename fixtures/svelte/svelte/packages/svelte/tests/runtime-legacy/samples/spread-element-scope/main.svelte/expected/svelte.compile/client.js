import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>red</div> <div>red</div> <div>red and bold</div>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.attribute_effect(div, () => ({ ...{ class: 'bar' }, class: 'foo' }), void 0, void 0, void 0, 'svelte-10afyce');

	var div_1 = $.sibling(div, 2);

	$.attribute_effect(div_1, () => ({ class: 'foo', ...{ class: 'qux' } }), void 0, void 0, void 0, 'svelte-10afyce');

	var div_2 = $.sibling(div_1, 2);

	$.attribute_effect(div_2, () => ({ ...{ class: 'bar' } }), void 0, void 0, void 0, 'svelte-10afyce');
	$.append($$anchor, fragment);
}