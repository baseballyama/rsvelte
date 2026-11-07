import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, useMediaQuery, P } from "flowbite-svelte";

export default function BpBasic($$anchor, $$props) {
	$.push($$props, true);

	const isMdAndUp = useMediaQuery("(min-width: 768px)");

	{
		const header = ($$anchor) => {
			$.next();

			var text = $.text('Opens on tablets and desktop');

			$.append($$anchor, text);
		};

		let $0 = $.derived(isMdAndUp);

		AccordionItem($$anchor, {
			get open() {
				return $.get($0);
			},
			header,
			children: ($$anchor, $$slotProps) => {
				P($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('This content is visible on medium screens and larger.');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { header: true, default: true }
		});
	}

	$.pop();
}