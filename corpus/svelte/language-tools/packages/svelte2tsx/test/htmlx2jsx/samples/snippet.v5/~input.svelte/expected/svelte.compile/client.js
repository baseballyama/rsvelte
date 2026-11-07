import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const foo = ($$anchor, x = $.noop) => {
	var div = root();
	var text = $.only_child(div);

	$.template_effect(() => $.set_text(text, `asd${x() ?? ''}`));
	$.append($$anchor, div);
};

const bar = ($$anchor) => {
	var div_1 = root_1();

	$.append($$anchor, div_1);
};

const await_inside = ($$anchor) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => foo, null, ($$anchor, bar) => {
		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, $.get(bar)));
		$.append($$anchor, text_1);
	});

	$.append($$anchor, fragment);
};

const defaultValue = ($$anchor, $$arg0) => {
	let x = $.derived_safe_equal(() => $.fallback($$arg0?.(), ''));
	var div_2 = root();
	var text_2 = $.only_child(div_2);

	$.template_effect(() => $.set_text(text_2, `asd${$.get(x) ?? ''}`));
	$.append($$anchor, div_2);
};

const jsDoc = ($$anchor, a = $.noop) => {
	$.next();

	var text_3 = $.text();

	$.template_effect(() => $.set_text(text_3, a()));
	$.append($$anchor, text_3);
};

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div>asd</div>`);
var root_2 = $.from_html(`<div></div>`);
var root_3 = $.from_html(`<p>html between snippets</p>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment_3 = root_4();
	var node_1 = $.first_child(fragment_3);

	foo(node_1, () => 1);

	var node_2 = $.sibling(node_1, 2);

	bar(node_2);

	var node_3 = $.sibling(node_2, 2);

	await_inside(node_3);

	var node_4 = $.sibling(node_3, 2);

	{
		const bar = ($$anchor, x = $.noop) => {
			var div_3 = root();
			var text_4 = $.only_child(div_3);

			$.template_effect(() => $.set_text(text_4, `asd${x() ?? ''}`));
			$.append($$anchor, div_3);
		};

		Component(node_4, {
			bar,
			children: ($$anchor, $$slotProps) => {
				var div_4 = root_2();

				div_4.textContent = asd;
				$.append($$anchor, div_4);
			},
			$$slots: { bar: true, default: true }
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		const row = ($$anchor, item = $.noop) => {
			$.next();

			var text_5 = $.text();

			$.template_effect(() => $.set_text(text_5, item()));
			$.append($$anchor, text_5);
		};

		const await_inside = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_6 = $.first_child(fragment_5);

			$.await(node_6, () => foo, null, ($$anchor, bar) => {
				var text_6 = $.text();

				$.template_effect(() => $.set_text(text_6, $.get(bar)));
				$.append($$anchor, text_6);
			});

			$.append($$anchor, fragment_5);
		};

		List(node_5, {
			data: [1, 2, 3],
			row,
			await_inside,
			$$slots: { row: true, await_inside: true }
		});
	}

	var node_7 = $.sibling(node_5, 2);

	List(node_7, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('implicit children');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	{
		const row1 = ($$anchor, item = $.noop) => {
			$.next();

			var text_8 = $.text();

			$.template_effect(() => $.set_text(text_8, item()));
			$.append($$anchor, text_8);
		};

		const row2 = ($$anchor, item = $.noop) => {
			$.next();

			var text_9 = $.text();

			$.template_effect(() => $.set_text(text_9, item()));
			$.append($$anchor, text_9);
		};

		List(node_8, {
			data: [1, 2, 3],
			row1,
			row2,
			children: ($$anchor, $$slotProps) => {
				var p = root_3();

				$.append($$anchor, p);
			},
			$$slots: { row1: true, row2: true, default: true }
		});
	}

	var node_9 = $.sibling(node_8, 2);

	$.snippet(node_9, () => children);
	$.append($$anchor, fragment_3);
}