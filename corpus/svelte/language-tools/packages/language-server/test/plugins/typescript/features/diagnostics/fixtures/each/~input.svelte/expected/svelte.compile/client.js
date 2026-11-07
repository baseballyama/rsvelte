import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	const simpleOptions = [];
	const complexOptions = [];
	const maybeUndefined = null;
	const badOptions = { object: {}, number: 1 };
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 17, () => simpleOptions, $.index, ($$anchor, option, i) => {
		var div = root();
		var text = $.only_child(div);

		$.template_effect(() => $.set_text(text, `${$.get(option) ?? ''}, ${i}`));
		$.append($$anchor, div);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => simpleOptions, $.index, ($$anchor, option, i) => {
		var div_1 = root();
		var text_1 = $.only_child(div_1);

		$.template_effect(() => $.set_text(text_1, `${$.get(option) ?? ''}, ${i}`));
		$.append($$anchor, div_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 19, () => complexOptions, (option) => typeof option === "string" ? option : option.value, ($$anchor, option, i) => {
		var div_2 = root();
		var text_2 = $.only_child(div_2);

		$.template_effect(() => $.set_text(text_2, `${(typeof $.get(option) === "string" ? $.get(option) : $.get(option).label) ?? ''}, ${$.get(i) ?? ''}`));
		$.append($$anchor, div_2);
	});

	var node_3 = $.sibling(node_2, 2);

	$.each(node_3, 17, () => badOptions.object, $.index, ($$anchor, option, i) => {
		var div_3 = root();
		var text_3 = $.only_child(div_3);

		$.template_effect(() => $.set_text(text_3, `${$.get(option) ?? ''} ${i}`));
		$.append($$anchor, div_3);
	});

	var node_4 = $.sibling(node_3, 2);

	$.each(node_4, 17, () => badOptions.number, $.index, ($$anchor, option, i) => {
		var div_4 = root();
		var text_4 = $.only_child(div_4);

		$.template_effect(() => $.set_text(text_4, `${$.get(option) ?? ''} ${i}`));
		$.append($$anchor, div_4);
	});

	var node_5 = $.sibling(node_4, 2);

	$.each(node_5, 17, () => maybeUndefined, $.index, ($$anchor, option, i) => {
		var div_5 = root();
		var text_5 = $.only_child(div_5);

		$.template_effect(() => $.set_text(text_5, `${$.get(option) ?? ''}, ${i}`));
		$.append($$anchor, div_5);
	});

	$.append($$anchor, fragment);
}