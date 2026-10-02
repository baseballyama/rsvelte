import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from 'A.svelte';

var root = $.from_html(`<div> <input/> <input/> <input/> <!>  <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function Test01_output($$anchor) {
	const foo = 'foo';
	let text = '';
	let value = '';
	let input;
	const myClass = 'my-class';
	const id = 'id';
	const attrs = {};
	const bar = '<div></div>';
	const o1 = 1;
	const o2 = 2;
	const expression = true;
	const list = [];
	var div = root();

	$.template_effect(() => {
		console.log({ o1: $.snapshot(o1) });

		debugger;
	});

	$.template_effect(() => {
		console.log({ o1: $.snapshot(o1), o2: $.snapshot(o2) });

		debugger;
	});

	var text_1 = $.child(div);

	text_1.nodeValue = 'foo ';

	var input_1 = $.sibling(text_1);

	$.remove_input_defaults(input_1);
	$.set_class(input_1, 1, 'foo my-class');

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);
	$.set_attribute(input_2, 'id', id);

	var input_3 = $.sibling(input_2, 2);

	$.attribute_effect(input_3, () => ({ ...attrs }), void 0, void 0, void 0, void 0, true);

	var node = $.sibling(input_3, 2);

	$.html(node, () => bar);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var text_2 = $.text('...');

			$.append($$anchor, text_2);
		};

		$.if(node_1, ($$render) => {
			if (expression) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_3 = $.text('...');

			$.append($$anchor, text_3);
		};

		var consequent_2 = ($$anchor) => {
			var text_4 = $.text('...');

			$.append($$anchor, text_4);
		};

		$.if(node_2, ($$render) => {
			if (expression) $$render(consequent_1); else if (expression) $$render(consequent_2, 1);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var text_5 = $.text('...');

			$.append($$anchor, text_5);
		};

		var alternate = ($$anchor) => {
			var text_6 = $.text('...');

			$.append($$anchor, text_6);
		};

		$.if(node_3, ($$render) => {
			if (expression) $$render(consequent_3); else $$render(alternate, -1);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_4 = ($$anchor) => {};
		var alternate_1 = ($$anchor) => {};

		$.if(node_4, ($$render) => {
			if (expression) $$render(consequent_4); else $$render(alternate_1, -1);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	$.each(node_5, 17, () => list, $.index, ($$anchor, item) => {
		$.next();

		var text_7 = $.text('...');

		$.append($$anchor, text_7);
	});

	var node_6 = $.sibling(node_5, 2);

	$.each(node_6, 17, () => list, $.index, ($$anchor, item) => {
		$.next();

		var text_8 = $.text('...');

		$.append($$anchor, text_8);
	});

	var node_7 = $.sibling(node_6, 2);

	$.each(node_7, 17, () => list, (item) => item.key, ($$anchor, item) => {
		$.next();

		var text_9 = $.text('...');

		$.append($$anchor, text_9);
	});

	var node_8 = $.sibling(node_7, 2);

	$.each(node_8, 19, () => list, (item) => item.key, ($$anchor, item) => {
		$.next();

		var text_10 = $.text('...');

		$.append($$anchor, text_10);
	});

	var node_9 = $.sibling(node_8, 2);

	$.each(
		node_9,
		17,
		() => list,
		$.index,
		($$anchor, item) => {
			$.next();

			var text_11 = $.text('...');

			$.append($$anchor, text_11);
		},
		($$anchor) => {
			$.next();

			var text_12 = $.text('...');

			$.append($$anchor, text_12);
		}
	);

	var node_10 = $.sibling(node_9, 2);

	$.await(
		node_10,
		() => expression,
		($$anchor) => {
			var text_15 = $.text('...');

			$.append($$anchor, text_15);
		},
		($$anchor, name) => {
			var text_13 = $.text('...');

			$.append($$anchor, text_13);
		},
		($$anchor, name) => {
			var text_14 = $.text('...');

			$.append($$anchor, text_14);
		}
	);

	var node_11 = $.sibling(node_10, 2);

	$.await(
		node_11,
		() => expression,
		($$anchor) => {
			var text_17 = $.text('...');

			$.append($$anchor, text_17);
		},
		($$anchor, name) => {
			var text_16 = $.text('...');

			$.append($$anchor, text_16);
		}
	);

	var node_12 = $.sibling(node_11, 2);

	$.await(node_12, () => expression, null, ($$anchor, name) => {
		var text_18 = $.text('...');

		$.append($$anchor, text_18);
	});

	var node_13 = $.sibling(node_12, 2);

	$.await(node_13, () => expression, null, void 0, ($$anchor, name) => {
		var text_19 = $.text('...');

		$.append($$anchor, text_19);
	});

	var node_14 = $.sibling(node_13, 2);

	$.await(node_14, () => expression, null, ($$anchor) => {
		var text_20 = $.text('...');

		$.append($$anchor, text_20);
	});

	var node_15 = $.sibling(node_14, 2);

	$.await(node_15, () => expression, null, void 0, ($$anchor) => {
		var text_21 = $.text('...');

		$.append($$anchor, text_21);
	});

	var node_16 = $.sibling(node_15, 2);

	$.await(
		node_16,
		() => expression,
		($$anchor) => {
			var text_24 = $.text('...');

			$.append($$anchor, text_24);
		},
		($$anchor) => {
			var text_22 = $.text('...');

			$.append($$anchor, text_22);
		},
		($$anchor) => {
			var text_23 = $.text('...');

			$.append($$anchor, text_23);
		}
	);

	var node_17 = $.sibling(node_16, 2);

	$.key(node_17, () => expression, ($$anchor) => {
		var text_25 = $.text('...');

		$.append($$anchor, text_25);
	});

	$.reset(div);
	$.template_effect(() => $.set_attribute(input_1, 'this', input));
	$.bind_value(input_1, () => text, ($$value) => text = $$value);
	$.bind_value(input_2, () => value, ($$value) => value = $$value);
	$.append($$anchor, div);
}