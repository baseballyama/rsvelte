import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	Parent($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);
				const baz = $.derived(() => $$slotProps.bar);

				Component($$anchor, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							const blubb = $.derived(() => $$slotProps.blubb);

							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(blubb)));
							$.append($$anchor, text);
						}
					}
				});
			},

			named: ($$anchor, $$slotProps) => {
				const bla = $.derived(() => $$slotProps.bla);

				Component($$anchor, {
					slot: 'named',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, `${foo ?? ''} ${baz ?? ''} ${$.get(bla) ?? ''}`));
							$.append($$anchor, text_1);
						}
					}
				});
			}
		}
	});
}