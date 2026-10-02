import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const snip = ($$anchor) => {};
var root = $.from_html(`<!> <!> <!> <!> <!> <!> <div></div> <!> <button> </button> `, 1);

export default function Main($$anchor) {
	let count1 = 1;
	let count2 = 1;

	function fn(ret) {
		if (count1 > 100) return ret;

		count1++;
		count2++;

		return ret;
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {};
		var d = $.derived(() => fn(false));
		var consequent_1 = ($$anchor) => {};
		var d_1 = $.derived(() => fn(true));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent); else if ($.get(d_1)) $$render(consequent_1, 1);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => fn([]), $.index, ($$anchor, x) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, ($.get(x), '')));
		$.append($$anchor, text);
	});

	var node_2 = $.sibling(node_1, 2);

	$.key(node_2, () => fn(1), ($$anchor) => {});

	var node_3 = $.sibling(node_2, 2);

	$.await(node_3, () => fn(Promise.resolve()), ($$anchor) => {});

	var node_4 = $.sibling(node_3, 2);

	$.snippet(node_4, () => fn(snip));

	var node_5 = $.sibling(node_4, 2);

	$.html(node_5, () => fn(''));

	var div = $.sibling(node_5, 2);

	$.attach(div, () => fn(() => {}));

	var node_6 = $.sibling(div, 2);

	$.key(node_6, () => 1, ($$anchor) => {
		const x = $.derived(() => fn(''));
		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, $.get(x)));
		$.append($$anchor, text_1);
	});

	var button = $.sibling(node_6, 2);
	var text_2 = $.only_child(button, true);
	var text_3 = $.sibling(button);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(button, 'data-foo', $0);
			$.set_text(text_2, $1);
			$.set_text(text_3, ` ${count1 ?? ''} - ${count2 ?? ''}`);
		},
		[() => fn(true), () => fn('inc')]
	);

	$.event('click', button, () => count1++);
	$.append($$anchor, fragment);
}