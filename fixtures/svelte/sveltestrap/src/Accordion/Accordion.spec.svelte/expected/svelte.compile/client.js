import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Accordion from './Accordion.svelte';
import { AccordionItem } from '../AccordionItem';

export default function Accordion_spec($$anchor) {
	Accordion($$anchor, {
		children: ($$anchor, $$slotProps) => {
			AccordionItem($$anchor, { active: true, class: 'peek-a-boo', header: 'Header!' });
		},
		$$slots: { default: true }
	});
}