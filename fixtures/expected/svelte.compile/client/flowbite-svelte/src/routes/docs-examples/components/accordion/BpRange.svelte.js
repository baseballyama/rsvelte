import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, useMediaQuery, useBreakpoints, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function BpRange($$anchor, $$props) {
	$.push($$props, true);

	const breakpoints = useBreakpoints();

	// Open from sm to lg (640px - 1023px)
	const tabletRange = $.derived(() => breakpoints.sm && !breakpoints.lg);

	// Open on specific breakpoints only
	const specificSizes = $.derived(() => breakpoints.sm && !breakpoints.md || breakpoints.lg && !breakpoints.xl);

	// Custom pixel range
	const customRange = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");

	var fragment = root();
	var node = $.first_child(fragment);

	{
		const header = ($$anchor) => {
			$.next();

			var text = $.text('Tablet Range (640px - 1023px)');

			$.append($$anchor, text);
		};

		AccordionItem(node, {
			get open() {
				return $.get(tabletRange);
			},
			header,
			children: ($$anchor, $$slotProps) => {
				P($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Open on tablets, closed on phones and large desktops.');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { header: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const header = ($$anchor) => {
			$.next();

			var text_2 = $.text('Small phones OR Large desktops only');

			$.append($$anchor, text_2);
		};

		AccordionItem(node_1, {
			get open() {
				return $.get(specificSizes);
			},
			header,
			children: ($$anchor, $$slotProps) => {
				P($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Open on sm-only OR lg-only, closed on other sizes.');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { header: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const header = ($$anchor) => {
			$.next();

			var text_4 = $.text('Custom Range');

			$.append($$anchor, text_4);
		};

		let $0 = $.derived(customRange);

		AccordionItem(node_2, {
			get open() {
				return $.get($0);
			},
			header,
			children: ($$anchor, $$slotProps) => {
				P($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Define exact pixel ranges for precise control.');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { header: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}