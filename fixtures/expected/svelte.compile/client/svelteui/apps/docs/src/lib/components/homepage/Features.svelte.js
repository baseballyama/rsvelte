import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { features } from '$lib/data';
import { Title, Text, SimpleGrid, ThemeIcon, Center, Stack, Paper } from '@svelteuidev/core';
import { fly } from 'svelte/transition';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div id="wrapper"><!></div>`);

export default function Features($$anchor) {
	var div = root_1();
	var node = $.child(div);

	SimpleGrid(node, {
		breakpoints: [
			{ minWidth: 1024, cols: 3, spacing: 'md' },
			{ minWidth: 768, cols: 2, spacing: 'sm' },
			{ minWidth: 640, cols: 1, spacing: 'sm' }
		],

		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => features, $.index, ($$anchor, $$item) => {
				let description = () => $.get($$item).description;
				let icon = () => $.get($$item).icon;
				let title = () => $.get($$item).title;

				Paper($$anchor, {
					shadow: 'xl',
					style: 'height: 100%',
					children: ($$anchor, $$slotProps) => {
						Stack($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								Center(node_2, {
									override: { jc: 'start', gap: '$10' },
									inline: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_3 = $.first_child(fragment_4);

										ThemeIcon(node_3, {
											variant: 'gradient',
											size: 'xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, icon, ($$anchor, $$component) => {
													$$component($$anchor, { size: 25 });
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});

										var node_5 = $.sibling(node_3, 2);

										Title(node_5, {
											order: 3,
											weight: 'extrabold',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, title()));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_2, 2);

								Text(node_6, {
									size: 'lg',
									override: { lineHeight: '$md' },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, description()));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}