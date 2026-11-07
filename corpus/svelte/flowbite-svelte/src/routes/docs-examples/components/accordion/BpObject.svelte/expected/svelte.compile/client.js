import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, useBreakpoints, P } from "flowbite-svelte";

export default function BpObject($$anchor, $$props) {
	$.push($$props, true);

	const breakpoints = useBreakpoints();

	{
		const header = ($$anchor) => {
			$.next();

			var text = $.text('Opens on medium screens+');

			$.append($$anchor, text);
		};

		AccordionItem($$anchor, {
			get open() {
				return breakpoints.md;
			},
			header,
			children: ($$anchor, $$slotProps) => {
				P($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Content for tablets and desktop users.');

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