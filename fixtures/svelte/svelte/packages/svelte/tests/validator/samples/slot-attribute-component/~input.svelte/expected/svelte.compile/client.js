import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Foo(node, {
		slot: 'foo',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('valid');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Foo(node_1, {
		slot: foo,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('valid');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Foo(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					Foo(node_4, {
						slot: 'foo',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('valid');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Foo(node_5, {
						slot: foo,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('valid');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_3, ($$render) => {
					if (true) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}