import 'svelte/internal/disclose-version';
import ButtonGroup from './ButtonGroup.svelte';
import * as $ from 'svelte/internal/client';
import { Story } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/ButtonGroup',
	component: ButtonGroup,
	parameters: { controls: { exclude: /^(click|default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
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
				'dark',
				'link'
			]
		},
		outline: { control: 'boolean' },
		size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
		vertical: { control: 'boolean' },
		'default ': {
			description: 'This is the default content slot.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		}
	},
	args: {
		class: '',
		color: 'primary',
		outline: false,
		size: '',
		vertical: false
	}
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="horizontal"></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function ButtonGroup_stories($$anchor) {
	const sizeMap = ['sm', 'md', 'lg'];
	const sizeToColorMap = { sm: 'primary', md: 'warning', lg: 'danger' };

	const basicSource = `
<ButtonGroup>
  <Button color="primary">Left</Button>
  <Button color="primary">Right</Button>
</ButtonGroup>
`;

	var fragment = root_3();
	var node = $.first_child(fragment);

	Story(node, {
		name: 'Basic',
		source: basicSource,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const argss = $.derived(() => $$slotProps.args);

				ButtonGroup($$anchor, $.spread_props(() => $.get(argss), {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Button(node_1, {
							get color() {
								return $.get(argss).color;
							},

							get outline() {
								return $.get(argss).outline;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Left');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						Button(node_2, {
							get color() {
								return $.get(argss).color;
							},

							get outline() {
								return $.get(argss).outline;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Right');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_3 = $.sibling(node, 2);

	Story(node_3, {
		name: 'Styles',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_4 = $.first_child(fragment_4);

					Button(node_4, {
						color: 'danger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Left');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						color: 'warning',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Middle');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Button(node_6, {
						color: 'success',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Right');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_3, 2);

	Story(node_7, {
		name: 'Outlines',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_8 = $.first_child(fragment_6);

					Button(node_8, {
						color: 'primary',
						outline: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Left');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Button(node_9, {
						color: 'primary',
						outline: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Middle');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Button(node_10, {
						color: 'primary',
						outline: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Right');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_7, 2);

	Story(node_11, {
		name: 'Sizes',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();

			$.each(div, 21, () => sizeMap, $.index, ($$anchor, size) => {
				ButtonGroup($$anchor, {
					get size() {
						return $.get(size);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_1();
						var node_12 = $.first_child(fragment_8);

						Button(node_12, {
							get color() {
								return sizeToColorMap[$.get(size)];
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('Left');

								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});

						var node_13 = $.sibling(node_12, 2);

						Button(node_13, {
							get color() {
								return sizeToColorMap[$.get(size)];
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_9 = $.text('Middle');

								$.append($$anchor, text_9);
							},
							$$slots: { default: true }
						});

						var node_14 = $.sibling(node_13, 2);

						Button(node_14, {
							get color() {
								return sizeToColorMap[$.get(size)];
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_10 = $.text('Right');

								$.append($$anchor, text_10);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_11, 2);

	Story(node_15, {
		name: 'Vertical',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				vertical: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_1();
					var node_16 = $.first_child(fragment_10);

					Button(node_16, {
						color: 'primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Top');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Button(node_17, {
						color: 'primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('Middle');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					Button(node_18, {
						color: 'primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Bottom');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}