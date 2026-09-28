import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Comp_1($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $$props.data.obj.arr, $.index, ($$anchor, i) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(i)));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
	$.pop();
}