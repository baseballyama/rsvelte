import 'svelte/internal/disclose-version';
import Spinner from './Spinner.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
	title: 'Stories/Spinner',
	component: Spinner,
	parameters: {},
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		type: { control: { type: 'select' }, options: ['border', 'grow'] },
		size: { control: { type: 'select' }, options: ['', 'sm'] },
		color: {
			control: { type: 'select' },
			options: [
				'primary',
				'secondary',
				'success',
				'danger',
				'warning',
				'info',
				'light',
				'dark'
			]
		}
	},
	args: { type: 'border', size: '', color: 'primary' }
};

var root = $.from_html(`<!> <br/> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Spinner_stories($$anchor) {
	const colors = [
		'primary',
		'secondary',
		'success',
		'danger',
		'warning',
		'info',
		'light',
		'dark'
	];

	var fragment = root_1();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => colors, $.index, ($$anchor, color) => {
					Spinner($$anchor, $.spread_props(() => $.get(args), {
						get color() {
							return $.get(color);
						}
					}));
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Story(node_2, { name: 'Basic' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Types',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_4 = $.first_child(fragment_3);

			$.each(node_4, 17, () => colors, $.index, ($$anchor, color) => {
				Spinner($$anchor, {
					type: 'border',
					get color() {
						return $.get(color);
					}
				});
			});

			var node_5 = $.sibling(node_4, 4);

			$.each(node_5, 17, () => colors, $.index, ($$anchor, color) => {
				Spinner($$anchor, {
					type: 'grow',
					get color() {
						return $.get(color);
					}
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Story(node_6, {
		name: 'Sizes',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_7 = $.first_child(fragment_6);

			$.each(node_7, 17, () => colors, $.index, ($$anchor, color) => {
				Spinner($$anchor, {
					size: 'sm',
					get color() {
						return $.get(color);
					}
				});
			});

			var node_8 = $.sibling(node_7, 4);

			$.each(node_8, 17, () => colors, $.index, ($$anchor, color) => {
				Spinner($$anchor, {
					size: 'sm',
					type: 'grow',
					get color() {
						return $.get(color);
					}
				});
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}