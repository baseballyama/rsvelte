import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { useSvelteUITheme } from '$lib/styles';
import { Group } from '../Group';
import { ActionIcon } from './index';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div style="padding:40px;"></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function ActionIcon_stories($$anchor, $$props) {
	$.push($$props, true);

	const theme = useSvelteUITheme();
	const colors = Object.keys(theme.colorNames);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/ActionIcon',
		get component() {
			return ActionIcon;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				ActionIcon($$anchor, $.spread_props(() => $.get(args)));
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Template(node_2, {
		id: 'variants',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Group($$anchor, {
					mt: 'xl',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_3 = $.first_child(fragment_3);

						ActionIcon(node_3, $.spread_props(() => $.get(args), { variant: 'hover' }));

						var node_4 = $.sibling(node_3, 2);

						ActionIcon(node_4, $.spread_props(() => $.get(args), { variant: 'filled' }));

						var node_5 = $.sibling(node_4, 2);

						ActionIcon(node_5, $.spread_props(() => $.get(args), { variant: 'outline' }));

						var node_6 = $.sibling(node_5, 2);

						ActionIcon(node_6, $.spread_props(() => $.get(args), { variant: 'light' }));

						var node_7 = $.sibling(node_6, 2);

						ActionIcon(node_7, $.spread_props(() => $.get(args), { variant: 'default' }));

						var node_8 = $.sibling(node_7, 2);

						ActionIcon(node_8, $.spread_props(() => $.get(args), { variant: 'transparent' }));
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_9 = $.sibling(node_2, 2);

	Story(node_9, { name: 'ActionIcon', id: 'actionIconStory' });

	var node_10 = $.sibling(node_9, 2);

	Story(node_10, {
		name: 'Colors',
		id: 'actionIconColorsStory',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();

			$.each(div, 21, () => colors, $.index, ($$anchor, color) => {
				Group($$anchor, {
					mt: 'xl',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_11 = $.first_child(fragment_5);

						ActionIcon(node_11, {
							get color() {
								return $.get(color);
							}
						});

						var node_12 = $.sibling(node_11, 2);

						ActionIcon(node_12, {
							get color() {
								return $.get(color);
							},
							variant: 'filled'
						});

						var node_13 = $.sibling(node_12, 2);

						ActionIcon(node_13, {
							get color() {
								return $.get(color);
							},
							variant: 'outline'
						});

						var node_14 = $.sibling(node_13, 2);

						ActionIcon(node_14, {
							get color() {
								return $.get(color);
							},
							variant: 'light'
						});

						var node_15 = $.sibling(node_14, 2);

						ActionIcon(node_15, {
							get color() {
								return $.get(color);
							},
							variant: 'default'
						});

						var node_16 = $.sibling(node_15, 2);

						ActionIcon(node_16, {
							get color() {
								return $.get(color);
							},
							variant: 'transparent'
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_10, 2);

	Story(node_17, {
		name: 'Disabled',
		id: 'actionDisabledStory',
		template: 'variants',
		args: { disabled: true }
	});

	var node_18 = $.sibling(node_17, 2);

	Story(node_18, {
		name: 'Loading',
		id: 'actionLoadingStory',
		template: 'variants',
		args: { loading: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}