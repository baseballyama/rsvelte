import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p slot="sub1"> </p>`);

export default function Input($$anchor) {
	Component($$anchor, {
		unshadowed1,
		foo: unshadowed2,
		subthing,
		shadowed1,
		'shadowed-2': shadowed2,
		templateString: ` ${complex ?? ''} `,
		complex: { complex },
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const n = $.derived(() => $$slotProps.name);
				const shadowed1 = $.derived(() => $$slotProps.shadowed1);
				const shadowed2 = $.derived(() => $$slotProps.shadowed2);
				const subthing = $.derived(() => $$slotProps.subthing);

				Sub($$anchor, {
					get subthing() {
						return $.get(subthing);
					},
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							const subthing = $.derived(() => $$slotProps.subthing);
							const othersubthing = $.derived(() => $$slotProps.othersubthing);

							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `${thing ?? ''}${$.get(subthing) ?? ''}`));
							$.append($$anchor, text);
						}
					}
				});
			},

			sub1: ($$anchor, $$slotProps) => {
				const subthing = $.derived(() => $$slotProps.subthing);
				var p = root();
				var text_1 = $.only_child(p);

				$.template_effect(() => $.set_text(text_1, `${thing ?? ''}${$.get(subthing) ?? ''}`));
				$.append($$anchor, p);
			},

			sub2: ($$anchor, $$slotProps) => {
				const subthing = $.derived(() => $$slotProps.subthing);
				const othersubthing = $.derived(() => $$slotProps.othersubthing);

				Sub($$anchor, {
					slot: 'sub2',
					get subthing() {
						return $.get(subthing);
					},
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, `${thing ?? ''}${$.get(subthing) ?? ''}`));
							$.append($$anchor, text_2);
						}
					}
				});
			}
		}
	});
}