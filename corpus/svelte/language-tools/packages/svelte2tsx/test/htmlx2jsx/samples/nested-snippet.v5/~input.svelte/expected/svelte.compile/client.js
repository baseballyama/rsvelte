import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const snippetBlock = ($$anchor) => {
	const foo = ($$anchor) => {};
	const foo2 = ($$anchor) => {};

	foo($$anchor);
};

var root = $.from_html(`<!> <!> <!> <!> <div><!></div> <!>`, 1);

export default function Input($$anchor) {
	var fragment_1 = root();
	var node = $.first_child(fragment_1);

	{
		var consequent = ($$anchor) => {
			const foo = ($$anchor) => {};

			foo($$anchor);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => arr, $.index, ($$anchor, item) => {
		const foo = ($$anchor) => {};

		foo($$anchor);
	});

	var node_2 = $.sibling(node_1, 2);

	$.key(node_2, () => key, ($$anchor) => {
		const foo = ($$anchor) => {};

		foo($$anchor);
	});

	var node_3 = $.sibling(node_2, 2);

	$.await(node_3, () => Promise.resolve(), null, ($$anchor, bar) => {
		const foo = ($$anchor) => {};

		foo($$anchor);
	});

	var div = $.sibling(node_3, 2);

	{
		const foo = ($$anchor) => {};
		var node_4 = $.child(div);

		foo(node_4);
		$.reset(div);
	}

	var node_5 = $.sibling(div, 2);

	{
		const foo = ($$anchor) => {};

		Component(node_5, {
			foo,
			children: ($$anchor, $$slotProps) => {
				foo($$anchor);
			},
			$$slots: { foo: true, default: true }
		});
	}

	$.append($$anchor, fragment_1);
}