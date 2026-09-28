import * as $ from 'svelte/internal/server';
import Accordion from './Accordion.svelte';
import { AccordionItem } from '../AccordionItem';

export default function Accordion_spec($$renderer) {
	Accordion($$renderer, {
		children: ($$renderer) => {
			AccordionItem($$renderer, { active: true, class: 'peek-a-boo', header: 'Header!' });
		},
		$$slots: { default: true }
	});
}