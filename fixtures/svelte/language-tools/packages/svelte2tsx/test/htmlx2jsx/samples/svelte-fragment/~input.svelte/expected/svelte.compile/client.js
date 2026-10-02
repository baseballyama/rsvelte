import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>hi</p>`);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Component(node, {
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},

		$$slots: {
			default: true,
			named: ($$anchor, $$slotProps) => {
				var p_1 = root();

				$.append($$anchor, p_1);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Component(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);
				const baz = $.derived(() => $$slotProps.bar);
				var p_2 = root_1();
				var text = $.only_child(p_2);

				$.template_effect(() => $.set_text(text, `${$.get(foo) ?? ''} ${$.get(baz) ?? ''}`));
				$.append($$anchor, p_2);
			},

			named: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);
				const baz = $.derived(() => $$slotProps.bar);
				var p_3 = root_1();
				var text_1 = $.only_child(p_3);

				$.template_effect(() => $.set_text(text_1, `${$.get(foo) ?? ''} ${$.get(baz) ?? ''}`));
				$.append($$anchor, p_3);
			}
		}
	});

	$.append($$anchor, fragment);
}