import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>child</span>`);
var root_1 = $.from_html(`<div>boundary content</div>`);
var root_2 = $.from_html(`<div> </div>`);
var root_3 = $.from_html(`<div>no space</div> <!> <!> <!> <div>after component</div> <!> <div>after boundary</div> <div>after comment</div> <div>before comment</div> <!> <div>after each</div> <!> <div>after render</div> <div>before render</div> <!> <!> <div>with spaces</div> <!> <div>spaces after component</div> <div>spaces after comment</div> <!> <div>spaces after render</div> <!> <div>newline between</div> <div>newline after comment</div> <!> <div>newline after each</div> <!> <div>after render</div>`, 1);

export default function Output($$anchor) {
	var fragment = root_3();

	$.head('q0jzpr', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Page Title';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	Component(node, {});

	var node_1 = $.sibling(node, 2);

	Component(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Component(node_2, {
		children: ($$anchor, $$slotProps) => {
			var span = root();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	$.boundary(node_3, {}, ($$anchor) => {
		var div = root_1();

		$.append($$anchor, div);
	});

	var node_4 = $.sibling(node_3, 8);

	$.each(node_4, 16, () => items, $.index, ($$anchor, item) => {
		var div_1 = root_2();
		var text = $.only_child(div_1, true);

		$.template_effect(() => $.set_text(text, item));
		$.append($$anchor, div_1);
	});

	var node_5 = $.sibling(node_4, 4);

	$.snippet(node_5, () => children);

	var node_6 = $.sibling(node_5, 6);

	$.snippet(node_6, () => children);

	var node_7 = $.sibling(node_6, 2);

	Component(node_7, {});

	var node_8 = $.sibling(node_7, 4);

	Component(node_8, {
		children: ($$anchor, $$slotProps) => {
			var span_1 = root();

			$.append($$anchor, span_1);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 6);

	$.snippet(node_9, () => children);

	var node_10 = $.sibling(node_9, 4);

	Component(node_10, {});

	var node_11 = $.sibling(node_10, 6);

	$.each(node_11, 16, () => items, $.index, ($$anchor, item) => {
		var div_2 = root_2();
		var text_1 = $.only_child(div_2, true);

		$.template_effect(() => $.set_text(text_1, item));
		$.append($$anchor, div_2);
	});

	var node_12 = $.sibling(node_11, 4);

	$.snippet(node_12, () => children);
	$.next(2);
	$.append($$anchor, fragment);
}