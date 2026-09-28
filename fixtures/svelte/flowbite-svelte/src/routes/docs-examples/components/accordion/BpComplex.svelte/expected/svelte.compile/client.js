import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Accordion,
	AccordionItem,
	P,
	useMediaQuery,
	useBreakpoints,
	useCurrentBreakpoint
} from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function BpComplex($$anchor, $$props) {
	$.push($$props, true);

	// Different approaches to responsive behavior
	const isMdAndUp = useMediaQuery("(min-width: 768px)");

	const breakpoints = useBreakpoints();
	const getCurrentBreakpoint = useCurrentBreakpoint();
	const currentBp = $.derived(getCurrentBreakpoint);
	const tabletOnly = $.derived(() => breakpoints.sm && !breakpoints.lg);
	const mobileOnly = $.derived(() => !breakpoints.sm);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Accordion(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				const header = ($$anchor) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, `📱 Tablet & Desktop (Current: ${$.get(currentBp) ?? ''})`));
					$.append($$anchor, text);
				};

				let $0 = $.derived(isMdAndUp);

				AccordionItem(node_1, {
					get open() {
						return $.get($0);
					},
					header,
					children: ($$anchor, $$slotProps) => {
						P($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Opens on tablets and larger screens. Stays closed on mobile.');

								$.append($$anchor, text_1);
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

					var text_2 = $.text('Always Interactive');

					$.append($$anchor, text_2);
				};

				AccordionItem(node_2, {
					header,
					children: ($$anchor, $$slotProps) => {
						P($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('This accordion item behaves normally on all screen sizes.');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { header: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Accordion(node_3, {
		children: ($$anchor, $$slotProps) => {
			{
				const header = ($$anchor) => {
					$.next();

					var text_4 = $.text('📱 Tablet Only (640px - 1023px)');

					$.append($$anchor, text_4);
				};

				AccordionItem($$anchor, {
					get open() {
						return $.get(tabletOnly);
					},
					header,
					children: ($$anchor, $$slotProps) => {
						P($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('This opens automatically on tablets but closes on mobile phones and large desktop screens.');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { header: true, default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Accordion(node_4, {
		children: ($$anchor, $$slotProps) => {
			{
				const header = ($$anchor) => {
					$.next();

					var text_6 = $.text('📱 Mobile Only (below 640px)');

					$.append($$anchor, text_6);
				};

				AccordionItem($$anchor, {
					get open() {
						return $.get(mobileOnly);
					},
					header,
					children: ($$anchor, $$slotProps) => {
						P($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Expanded by default on mobile for better accessibility, collapsed on larger screens to save space.');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { header: true, default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}