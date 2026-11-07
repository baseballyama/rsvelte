import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div slot="named"> </div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Comp(node_1, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const foo = $.derived(() => $$slotProps.foo);

						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(foo)));
						$.append($$anchor, text);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					Comp($$anchor, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const bar = $.derived(() => $$slotProps.foo);

								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, $.get(bar)));
								$.append($$anchor, text_1);
							}
						}
					});
				};

				var consequent_1 = ($$anchor) => {
					Comp($$anchor, {
						$$slots: {
							named: ($$anchor, $$slotProps) => {
								const foo = $.derived(() => $$slotProps.foo);
								const foo1 = $.derived(() => $$slotProps.foo1);
								var div = root();
								var text_2 = $.only_child(div, true);

								$.template_effect(() => $.set_text(text_2, $.get(foo)));
								$.append($$anchor, div);
							}
						}
					});
				};

				var alternate = ($$anchor) => {
					Comp($$anchor, {
						$$slots: {
							named: ($$anchor, $$slotProps) => {
								const bar = $.derived(() => $$slotProps.foo);
								var div_1 = root();
								var text_3 = $.only_child(div_1, true);

								$.template_effect(() => $.set_text(text_3, $.get(bar)));
								$.append($$anchor, div_1);
							}
						}
					});
				};

				$.if(node_2, ($$render) => {
					if (hi && bye) $$render(consequent); else if (cool) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (hello) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
}