import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FancyList from 'mod';

var root = $.from_html(`<div slot="item"> </div>`);
var root_1 = $.from_html(`<!> `, 1);

export default function Let_directive01_input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	FancyList(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const data = $.derived(() => $$slotProps.foo);

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `${$.get(data) ?? ''} ${item ?? ''} no-def`));
				$.append($$anchor, text);
			},

			item: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				const item2 = $.derived(() => $$slotProps.item2);
				const bar = $.derived(() => $$slotProps.item3);
				var div = root();
				var text_1 = $.only_child(div, true);

				$.template_effect(() => $.set_text(text_1, $.get(item).text));
				$.append($$anchor, div);
			}
		}
	});

	var text_2 = $.sibling(node);

	text_2.nodeValue = ` ${data ?? ''} no-def`;
	$.append($$anchor, fragment);
}