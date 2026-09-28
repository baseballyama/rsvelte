import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { useSvelteUITheme } from '$lib/styles';
import { Group } from '../Group';
import { Stack } from '../Stack';
import { Chip } from './index';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Chip_stories($$anchor, $$props) {
	$.push($$props, true);

	const theme = useSvelteUITheme();
	const colors = Object.keys(theme.colorNames);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Chip',
		get component() {
			return Chip;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Chip($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'Chip', args: { label: 'Chip' }, id: 'chipStory' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Colors',
		id: 'chipColorsStory',
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.each(node_4, 17, () => colors, $.index, ($$anchor, color) => {
						Group($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_5 = $.first_child(fragment_5);

								Chip(node_5, {
									get color() {
										return $.get(color);
									},
									variant: 'filled',
									checked: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, `Filled ${$.get(color) ?? ''} chip`));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								Chip(node_6, {
									get color() {
										return $.get(color);
									},
									variant: 'outline',
									checked: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, `Outlined ${$.get(color) ?? ''} chip`));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_3, 2);

	Story(node_7, {
		name: 'States',
		id: 'chipStatesStory',
		children: ($$anchor, $$slotProps) => {
			Group($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_1();
					var node_8 = $.first_child(fragment_9);

					Chip(node_8, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Default chip');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Chip(node_9, {
						variant: 'filled',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Filled chip');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Chip(node_10, {
						variant: 'outline',
						checked: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Outline chip');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Chip(node_11, {
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Disabled chip');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Chip(node_12, {
						checked: true,
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Checked disabled chip');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_7, 2);

	Story(node_13, {
		name: 'Sizes',
		id: 'chipSizesStory',
		children: ($$anchor, $$slotProps) => {
			Group($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_2();
					var node_14 = $.first_child(fragment_11);

					Chip(node_14, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Default chip');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Chip(node_15, {
						size: 'xs',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Extra small chip');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Chip(node_16, {
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Small chip');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Chip(node_17, {
						size: 'md',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Medium chip');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					Chip(node_18, {
						size: 'lg',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Large chip');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					Chip(node_19, {
						size: 'xl',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('Extra large chip');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}