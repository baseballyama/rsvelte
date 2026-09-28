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
					get text() {
						return $.get(text);
					},

					$$slots: {
						footer: ($$anchor, $$slotProps) => {
							var div = root();
							var text_1 = $.only_child(div, true);

							$.template_effect(() => $.set_text(text_1, $.get(text)));
							$.append($$anchor, div);
						}
					}
				});
			}
		}
	});
}