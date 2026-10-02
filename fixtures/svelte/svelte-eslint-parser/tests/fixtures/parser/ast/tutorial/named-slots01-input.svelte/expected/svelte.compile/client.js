import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContactCard from './ContactCard.svelte';

var root = $.from_html(`<span slot="name">P. Sherman</span>`);
var root_1 = $.from_html(`<span slot="address">42 Wallaby Way<br/> Sydney</span>`);

export default function Named_slots01_input($$anchor) {
	ContactCard($$anchor, {
		$$slots: {
			name: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			},

			address: ($$anchor, $$slotProps) => {
				var span_1 = root_1();

				$.append($$anchor, span_1);
			}
		}
	});
}