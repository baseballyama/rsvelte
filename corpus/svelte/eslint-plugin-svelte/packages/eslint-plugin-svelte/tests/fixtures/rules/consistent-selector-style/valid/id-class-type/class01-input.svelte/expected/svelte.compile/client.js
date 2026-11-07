import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="iterated-each svelte-1cg92pd"> </span>`);
var root_1 = $.from_html(`<span class="iterated-component svelte-1cg92pd">Text 5</span>`);
var root_2 = $.from_html(`<a class="link svelte-1cg92pd">Click me!</a> <a class="link svelte-1cg92pd">Click me two!</a> <b class="bold svelte-1cg92pd">Text 1</b> <b class="bold svelte-1cg92pd">Text 2</b> <b data-key="val">Text 2</b> <b>Text 3</b> <!> <!>`, 1);

export default function Class01_input($$anchor) {
	var fragment = root_2();
	var b = $.sibling($.first_child(fragment), 10);

	$.set_class(b, 1, 'svelte-1cg92pd', null, {}, { conditional: true });

	var node = $.sibling(b, 2);

	$.each(node, 16, () => ["one", "two"], $.index, ($$anchor, iter) => {
		var span = root();
		var text = $.only_child(span, true);

		$.template_effect(() => $.set_text(text, iter));
		$.append($$anchor, span);
	});

	var node_1 = $.sibling(node, 2);

	CustomComponent(node_1, {
		children: ($$anchor, $$slotProps) => {
			var span_1 = root_1();

			$.append($$anchor, span_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}