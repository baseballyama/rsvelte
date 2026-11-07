import * as $ from 'svelte/internal/server';
import ContactCard from './ContactCard.svelte';

export default function Named_slots01_input($$renderer) {
	ContactCard($$renderer, {
		$$slots: {
			name: ($$renderer) => {
				$$renderer.push(`<span slot="name">P. Sherman</span>`);
			},

			address: ($$renderer) => {
				$$renderer.push(`<span slot="address">42 Wallaby Way<br/> Sydney</span>`);
			}
		}
	});
}