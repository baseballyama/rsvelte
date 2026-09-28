import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Stack from "carbon-components-svelte/Stack/Stack.svelte";

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<span>horizontal-gap-1</span>`);
var root_2 = $.from_html(`<span>horizontal-gap-5</span>`);
var root_3 = $.from_html(`<span>horizontal-gap-13</span>`);
var root_4 = $.from_html(`<p>custom-gap-200px</p>`);
var root_5 = $.from_html(`<p>custom-gap-1.5rem</p>`);
var root_6 = $.from_html(`<li>custom-tag-ul</li>`);
var root_7 = $.from_html(`<div>custom-tag-section</div>`);
var root_8 = $.from_html(`<li>combined-props</li>`);
var root_9 = $.from_html(`<p>gap-0</p>`);
var root_10 = $.from_html(`<span>horizontal-gap-0</span>`);
var root_11 = $.from_html(`<p>inline-default</p>`);
var root_12 = $.from_html(`<span>inline-horizontal</span>`);
var root_13 = $.from_html(`<span>wrap-wrap</span>`);
var root_14 = $.from_html(`<span>wrap-reverse</span>`);
var root_15 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Stack_test($$anchor) {
	const gaps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
	var fragment = root_15();
	var node = $.first_child(fragment);

	$.each(node, 17, () => gaps, $.index, ($$anchor, gap) => {
		Stack($$anchor, {
			get gap() {
				return $.get(gap);
			},

			children: ($$anchor, $$slotProps) => {
				var p = root();
				var text = $.only_child(p);

				$.template_effect(() => $.set_text(text, `gap-${$.get(gap) ?? ''}`));
				$.append($$anchor, p);
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Stack(node_1, {
		orientation: 'horizontal',
		gap: 1,
		children: ($$anchor, $$slotProps) => {
			var span = root_1();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Stack(node_2, {
		orientation: 'horizontal',
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var span_1 = root_2();

			$.append($$anchor, span_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Stack(node_3, {
		orientation: 'horizontal',
		gap: 13,
		children: ($$anchor, $$slotProps) => {
			var span_2 = root_3();

			$.append($$anchor, span_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Stack(node_4, {
		gap: '200px',
		children: ($$anchor, $$slotProps) => {
			var p_1 = root_4();

			$.append($$anchor, p_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Stack(node_5, {
		gap: '1.5rem',
		children: ($$anchor, $$slotProps) => {
			var p_2 = root_5();

			$.append($$anchor, p_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Stack(node_6, {
		tag: 'ul',
		gap: 3,
		children: ($$anchor, $$slotProps) => {
			var li = root_6();

			$.append($$anchor, li);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Stack(node_7, {
		tag: 'section',
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var div = root_7();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Stack(node_8, {
		tag: 'ol',
		gap: 13,
		orientation: 'horizontal',
		children: ($$anchor, $$slotProps) => {
			var li_1 = root_8();

			$.append($$anchor, li_1);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Stack(node_9, {
		gap: 0,
		children: ($$anchor, $$slotProps) => {
			var p_3 = root_9();

			$.append($$anchor, p_3);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Stack(node_10, {
		orientation: 'horizontal',
		gap: 0,
		children: ($$anchor, $$slotProps) => {
			var span_3 = root_10();

			$.append($$anchor, span_3);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Stack(node_11, {
		inline: true,
		children: ($$anchor, $$slotProps) => {
			var p_4 = root_11();

			$.append($$anchor, p_4);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Stack(node_12, {
		inline: true,
		gap: 3,
		orientation: 'horizontal',
		children: ($$anchor, $$slotProps) => {
			var span_4 = root_12();

			$.append($$anchor, span_4);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Stack(node_13, {
		orientation: 'horizontal',
		wrap: 'wrap',
		gap: 3,
		children: ($$anchor, $$slotProps) => {
			var span_5 = root_13();

			$.append($$anchor, span_5);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Stack(node_14, {
		orientation: 'horizontal',
		wrap: 'wrap-reverse',
		gap: 3,
		children: ($$anchor, $$slotProps) => {
			var span_6 = root_14();

			$.append($$anchor, span_6);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}