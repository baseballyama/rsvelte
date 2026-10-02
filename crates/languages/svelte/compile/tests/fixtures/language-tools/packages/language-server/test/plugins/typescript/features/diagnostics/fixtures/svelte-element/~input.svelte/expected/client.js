import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import 'svelte/elements';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	let tag = 'div';
	let tagString = '';
	let elementDiv;
	let elementOther;
	let elementOther2;

	() => {
		elementDiv;
		elementOther;
		elementOther2;
	};

	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => tag, false);

	var node_1 = $.sibling(node, 2);

	$.element(node_1, () => tag, false, ($$element_1, $$anchor) => {
		var text = $.text();

		text.nodeValue = 'div';
		$.append($$anchor, text);
	});

	var node_2 = $.sibling(node_1, 2);

	$.element(node_2, () => tag, false, ($$element_2, $$anchor) => {
		$.bind_this($$element_2, ($$value) => elementDiv = $$value, () => elementDiv);
		$.event('click', $$element_2, () => tag);
	});

	var node_3 = $.sibling(node_2, 2);

	$.element(node_3, () => tagString, false, ($$element_3, $$anchor) => {
		$.bind_this($$element_3, ($$value) => elementOther = $$value, () => elementOther);
		$.event('click', $$element_3, (e) => e.currentTarget);
	});

	var node_4 = $.sibling(node_3, 2);

	$.element(node_4, () => tag, false, ($$element_4, $$anchor) => {
		$.bind_this($$element_4, ($$value) => elementOther2 = $$value, () => elementOther2);
	});

	var node_5 = $.sibling(node_4, 2);

	$.element(node_5, () => tag, false, ($$element_5, $$anchor) => {
		$.attribute_effect($$element_5, () => ({ cellpadding: 1 }));
	});

	$.append($$anchor, fragment);
}