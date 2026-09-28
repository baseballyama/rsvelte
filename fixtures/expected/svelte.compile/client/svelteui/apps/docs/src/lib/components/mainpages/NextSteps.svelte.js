import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group, ThemeIcon, Text, SimpleGrid, Anchor } from '@svelteuidev/core';
import { NEXT_STEPS_DATA } from '$lib/data';

var root = $.from_html(`<!> <!>`, 1);

export default function NextSteps($$anchor) {
	// @ts-nocheck
	const styles = {
		focusRing: 'auto',
		display: 'block',
		padding: '$xlPX',
		borderRadius: '$md',
		border: `1px solid $gray300`,
		backgroundColor: 'white',
		color: 'black',
		transition: 'box-shadow 200ms ease, transform 100ms ease',
		'&:hover': {
			transform: 'scale(1.01)',
			boxShadow: '$md',
			textDecoration: 'none'
		}
	};

	SimpleGrid($$anchor, {
		cols: 2,
		breakpoints: [{ maxWidth: 800, cols: 1 }],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => NEXT_STEPS_DATA, $.index, ($$anchor, item) => {
				Anchor($$anchor, {
					root: 'a',
					get href() {
						return $.get(item).link;
					},

					get override() {
						return styles;
					},
					underline: false,
					class: 'next_steps',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_1 = $.first_child(fragment_3);

						Group(node_1, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_2 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => ({ backgroundColor: `${$.get(item).color} !important` }));

									ThemeIcon(node_2, {
										size: 34,
										get override() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_3 = $.first_child(fragment_5);

											$.component(node_3, () => $.get(item).icon, ($$anchor, $$component) => {
												$$component($$anchor, { size: 20 });
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								}

								var node_4 = $.sibling(node_2, 2);

								Text(node_4, {
									weight: 500,
									size: 'lg',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(item).title));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_1, 2);

						Text(node_5, {
							size: 'sm',
							color: 'dimmed',
							override: { lineHeight: 1.6, mt: 16 },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, $.get(item).description));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}