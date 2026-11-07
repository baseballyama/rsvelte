import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		$.css_props(node, () => ({ '--custom-cssprop': 'foo' }));

		Parent(node.lastChild, {
			bare: true,
			shorthand,
			text1: 'val1',
			text2: 'val2',
			text3: `a${a ?? ''}b${b ?? ''}`,
			textEmpty: '',
			literal: true,
			strLiteral: 'foo',
			complex: { a },
			'a-dashed-complex': { a },
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$anchor, $$slotProps) => {
					const foo = $.derived(() => $$slotProps.foo);
					var div = root();
					var text = $.only_child(div, true);

					$.template_effect(() => $.set_text(text, $.get(foo)));
					$.append($$anchor, div);
				},

				named: ($$anchor, $$slotProps) => {
					const bar = $.derived(() => $$slotProps.bar);

					Component($$anchor, {
						slot: 'named',
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, `${foo ?? ''} ${$.get(bar) ?? ''}`));
								$.append($$anchor, text_1);
							}
						}
					});
				}
			}
		});

		$.reset(node);
	}

	$.append($$anchor, fragment);
}