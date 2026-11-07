import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from "./Nested.svelte";
import Nested2 from "./Nested2.svelte";

var root = $.from_html(`<div slot="footer"> </div>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		$$slots: {
			inner: ($$anchor, $$slotProps) => {
				const text = $.derived(() => $$slotProps.text);

				Nested2($$anchor, {
					slot: 'inner',
					$$slots: {
						footer: ($$anchor, $$slotProps) => {
							const text2 = $.derived(() => $.get(text));
							var div = root();
							var text_1 = $.only_child(div);

							$.template_effect(() => $.set_text(text_1, `${$.get(text) ?? ''} ${$.get(text2) ?? ''}`));
							$.append($$anchor, div);
						}
					}
				});
			}
		}
	});
}