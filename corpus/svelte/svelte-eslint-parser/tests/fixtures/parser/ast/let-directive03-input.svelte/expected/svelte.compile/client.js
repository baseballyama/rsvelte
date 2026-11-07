import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FancyList from 'mod';

var root = $.from_html(`<div slot="item"> </div>`);

export default function Let_directive03_input($$anchor) {
	FancyList($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const data = $.derived(() => $$slotProps.foo);

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, $.get(data)));
				$.append($$anchor, text);
			},

			item: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				const item2 = $.derived(() => $$slotProps.item2);
				var div = root();
				var text_1 = $.only_child(div, true);

				$.template_effect(() => {
					$.set_class(div, 1, $.clsx($.get(item2).class));
					$.set_text(text_1, $.get(item).text);
				});

				$.append($$anchor, div);
			}
		}
	});
}