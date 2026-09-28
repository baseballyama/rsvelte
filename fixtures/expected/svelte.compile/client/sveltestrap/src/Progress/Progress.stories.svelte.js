import 'svelte/internal/disclose-version';
import Progress from './Progress.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
	title: 'Stories/Progress',
	component: Progress,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		animated: { control: 'boolean' },
		bar: { control: 'boolean' },
		barClassName: { control: 'text' },
		class: { className: 'string', table: { disable: true } },
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
		},
		max: { control: 'number' },
		multi: { control: 'boolean' },
		striped: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		value: { control: 'number' },
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
		animated: false,
		bar: false,
		barClassName: '',
		color: 'primary',
		max: 100,
		multi: false,
		striped: false,
		theme: null,
		value: 0
	}
};

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="progress-example"><div class="text-content">Plain</div> <!> <br/> <div class="text-content">With Labels</div> <!> <br/> <div class="text-content">Stripes and Animations</div> <!></div>`);
var root_5 = $.from_html(`<div class="progress-example"><div class="text-content">1 of 5</div> <!> <br/> <div class="text-content">50 of 135</div> <!> <br/> <div class="text-content">75 of 111</div> <!> <br/> <div class="text-content">463 of 500</div> <!> <br/> <div class="text-content">Various (40) of 55</div> <!></div>`);
var root_6 = $.from_html(`<div class="progress-example"><div class="text-content">Dark Theme</div> <!> <!> <!> <div class="text-content">Light Theme</div> <!> <!> <!></div>`);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Progress_stories($$anchor) {
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

	var fragment = root_7();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => colors, $.index, ($$anchor, color) => {
					Progress($$anchor, $.spread_props(() => $.get(args), {
						get color() {
							return $.get(color);
						},
						value: Math.random() * 50 + 50,
						class: 'mb-2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(color)));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
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
		name: 'Labels',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_4 = $.first_child(fragment_4);

			Progress(node_4, {
				value: 25,
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('25%');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Progress(node_5, {
				value: 50,
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('1/2');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Progress(node_6, {
				value: 75,
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('You\'re almost there!');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Progress(node_7, {
				color: 'success',
				value: 100,
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('You did it!');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Progress(node_8, {
				multi: true,
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_9 = $.first_child(fragment_5);

					Progress(node_9, {
						bar: true,
						value: 15,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Meh');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Progress(node_10, {
						bar: true,
						color: 'success',
						value: 30,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Wow!');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Progress(node_11, {
						bar: true,
						color: 'info',
						value: 25,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Cool');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Progress(node_12, {
						bar: true,
						color: 'warning',
						value: 20,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('20%');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					Progress(node_13, {
						bar: true,
						color: 'danger',
						value: 5,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('!!');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_3, 2);

	Story(node_14, {
		name: 'Striped',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_2();
			var node_15 = $.first_child(fragment_6);

			Progress(node_15, { striped: true, value: 2 * 5, class: 'mb-2' });

			var node_16 = $.sibling(node_15, 2);

			Progress(node_16, { striped: true, color: 'success', value: 25, class: 'mb-2' });

			var node_17 = $.sibling(node_16, 2);

			Progress(node_17, { striped: true, color: 'info', value: 50, class: 'mb-2' });

			var node_18 = $.sibling(node_17, 2);

			Progress(node_18, { striped: true, color: 'warning', value: 75, class: 'mb-2' });

			var node_19 = $.sibling(node_18, 2);

			Progress(node_19, { striped: true, color: 'danger', value: 100, class: 'mb-2' });

			var node_20 = $.sibling(node_19, 2);

			Progress(node_20, {
				multi: true,
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_1();
					var node_21 = $.first_child(fragment_7);

					Progress(node_21, { striped: true, bar: true, value: 10 });

					var node_22 = $.sibling(node_21, 2);

					Progress(node_22, { striped: true, bar: true, color: 'success', value: 30 });

					var node_23 = $.sibling(node_22, 2);

					Progress(node_23, { striped: true, bar: true, color: 'warning', value: 20 });

					var node_24 = $.sibling(node_23, 2);

					Progress(node_24, { striped: true, bar: true, color: 'danger', value: 20 });
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_14, 2);

	Story(node_25, {
		name: 'Animated',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_2();
			var node_26 = $.first_child(fragment_8);

			Progress(node_26, { animated: true, value: 2 * 5, class: 'mb-2' });

			var node_27 = $.sibling(node_26, 2);

			Progress(node_27, { animated: true, color: 'success', value: 25, class: 'mb-2' });

			var node_28 = $.sibling(node_27, 2);

			Progress(node_28, { animated: true, color: 'info', value: 50, class: 'mb-2' });

			var node_29 = $.sibling(node_28, 2);

			Progress(node_29, { animated: true, color: 'warning', value: 75, class: 'mb-2' });

			var node_30 = $.sibling(node_29, 2);

			Progress(node_30, { animated: true, color: 'danger', value: 100, class: 'mb-2' });

			var node_31 = $.sibling(node_30, 2);

			Progress(node_31, {
				multi: true,
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_1();
					var node_32 = $.first_child(fragment_9);

					Progress(node_32, { animated: true, bar: true, value: 10 });

					var node_33 = $.sibling(node_32, 2);

					Progress(node_33, { animated: true, bar: true, color: 'success', value: 30 });

					var node_34 = $.sibling(node_33, 2);

					Progress(node_34, { animated: true, bar: true, color: 'warning', value: 20 });

					var node_35 = $.sibling(node_34, 2);

					Progress(node_35, { animated: true, bar: true, color: 'danger', value: 20 });
					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_36 = $.sibling(node_25, 2);

	Story(node_36, {
		name: 'Multi',
		children: ($$anchor, $$slotProps) => {
			var div = root_4();
			var node_37 = $.sibling($.child(div), 2);

			Progress(node_37, {
				multi: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var node_38 = $.first_child(fragment_10);

					Progress(node_38, { bar: true, value: 15 });

					var node_39 = $.sibling(node_38, 2);

					Progress(node_39, { bar: true, color: 'success', value: 20 });

					var node_40 = $.sibling(node_39, 2);

					Progress(node_40, { bar: true, color: 'info', value: 20 });

					var node_41 = $.sibling(node_40, 2);

					Progress(node_41, { bar: true, color: 'warning', value: 20 });

					var node_42 = $.sibling(node_41, 2);

					Progress(node_42, { bar: true, color: 'danger', value: 15 });
					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_43 = $.sibling(node_37, 6);

			Progress(node_43, {
				multi: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_1();
					var node_44 = $.first_child(fragment_11);

					Progress(node_44, {
						bar: true,
						value: 15,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Meh');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					var node_45 = $.sibling(node_44, 2);

					Progress(node_45, {
						bar: true,
						color: 'success',
						value: 35,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Wow!');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					var node_46 = $.sibling(node_45, 2);

					Progress(node_46, {
						bar: true,
						color: 'warning',
						value: 25,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('25%');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					var node_47 = $.sibling(node_46, 2);

					Progress(node_47, {
						bar: true,
						color: 'danger',
						value: 25,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('LOOK OUT!!');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			var node_48 = $.sibling(node_43, 6);

			Progress(node_48, {
				multi: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = root_3();
					var node_49 = $.first_child(fragment_12);

					Progress(node_49, {
						bar: true,
						striped: true,
						value: 15,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('Stripes');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});

					var node_50 = $.sibling(node_49, 2);

					Progress(node_50, {
						bar: true,
						animated: true,
						color: 'success',
						value: 30,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('Animated Stripes');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					var node_51 = $.sibling(node_50, 2);

					Progress(node_51, {
						bar: true,
						color: 'info',
						value: 25,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('Plain');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_52 = $.sibling(node_36, 2);

	Story(node_52, {
		name: 'Max',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_5();
			var node_53 = $.sibling($.child(div_1), 2);

			Progress(node_53, { value: 1, max: 5 });

			var node_54 = $.sibling(node_53, 6);

			Progress(node_54, { value: 50, max: 135 });

			var node_55 = $.sibling(node_54, 6);

			Progress(node_55, { value: 75, max: 111 });

			var node_56 = $.sibling(node_55, 6);

			Progress(node_56, { value: 463, max: 500 });

			var node_57 = $.sibling(node_56, 6);

			Progress(node_57, {
				multi: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root_1();
					var node_58 = $.first_child(fragment_13);

					Progress(node_58, {
						bar: true,
						value: 5,
						max: 55,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('5');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					var node_59 = $.sibling(node_58, 2);

					Progress(node_59, {
						bar: true,
						color: 'success',
						value: 15,
						max: 55,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('15');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});

					var node_60 = $.sibling(node_59, 2);

					Progress(node_60, {
						bar: true,
						color: 'warning',
						value: 10,
						max: 55,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_19 = $.text('10');

							$.append($$anchor, text_19);
						},
						$$slots: { default: true }
					});

					var node_61 = $.sibling(node_60, 2);

					Progress(node_61, {
						bar: true,
						color: 'danger',
						value: 10,
						max: 55,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_20 = $.text('10');

							$.append($$anchor, text_20);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_62 = $.sibling(node_52, 2);

	Story(node_62, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_6();
			var node_63 = $.sibling($.child(div_2), 2);

			Progress(node_63, {
				theme: 'dark',
				value: 25,
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_21 = $.text('25%');

					$.append($$anchor, text_21);
				},
				$$slots: { default: true }
			});

			var node_64 = $.sibling(node_63, 2);

			Progress(node_64, { theme: 'dark', striped: true, value: 2 * 5, class: 'mb-2' });

			var node_65 = $.sibling(node_64, 2);

			Progress(node_65, { theme: 'dark', animated: true, value: 2 * 5, class: 'mb-2' });

			var node_66 = $.sibling(node_65, 4);

			Progress(node_66, {
				theme: 'light',
				value: 25,
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('25%');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			var node_67 = $.sibling(node_66, 2);

			Progress(node_67, { theme: 'light', striped: true, value: 2 * 5, class: 'mb-2' });

			var node_68 = $.sibling(node_67, 2);

			Progress(node_68, { theme: 'light', animated: true, value: 2 * 5, class: 'mb-2' });
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}