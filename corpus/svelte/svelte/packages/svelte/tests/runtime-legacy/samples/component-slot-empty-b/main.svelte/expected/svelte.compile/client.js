import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from "./Nested.svelte";

var root = $.from_html(`<input slot="slot1"/>`);

export default function Main($$anchor) {
	Nested($$anchor, {
		$$slots: {
			slot1: ($$anchor, $$slotProps) => {
				var input = root();

				$.append($$anchor, input);
			}
		}
	});
}