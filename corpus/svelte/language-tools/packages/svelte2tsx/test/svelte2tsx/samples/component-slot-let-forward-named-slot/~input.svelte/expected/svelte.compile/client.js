import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div slot="b"><!></div>`);

export default function Input($$anchor, $$props) {
	Component($$anchor, {
		$$slots: {
			b: ($$anchor, $$slotProps) => {
				const a = $.derived(() => $$slotProps.a);
				var div = root();
				var node = $.child(div);

				$.slot(
					node,
					$$props,
					'default',
					{
						get a() {
							return $.get(a);
						}
					},
					null
				);

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});
}