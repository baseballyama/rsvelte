import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Col, Container, Row } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Grid',
	parameters: {},
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		sm: { control: 'boolean' },
		md: { control: 'boolean' },
		lg: { control: 'boolean' },
		xl: { control: 'boolean' },
		xxl: { control: 'boolean' },
		fluid: { control: 'boolean' }
	},
	args: {
		sm: true,
		md: true,
		lg: true,
		xl: true,
		xxl: true,
		fluid: true
	}
};

var root = $.from_html(`<div>col</div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div>col-3</div>`);
var root_3 = $.from_html(`<div>col-auto</div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div>col-6</div>`);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<div>col-6 col-sm-4</div>`);
var root_8 = $.from_html(`<div>col-sm-4</div>`);
var root_9 = $.from_html(`<div>col-sm-6 order-sm-2 offset-sm-1</div>`);
var root_10 = $.from_html(`<div>col-sm-1 rounded2 col-md-6 offset-md-3</div>`);
var root_11 = $.from_html(`<div>col-offset-sm-1</div>`);
var root_12 = $.from_html(`<div>col-sm-auto offset-sm-1</div>`);
var root_13 = $.from_html(`<div>col-1</div>`);
var root_14 = $.from_html(`<div>col-2</div>`);
var root_15 = $.from_html(`<div>col-4</div>`);
var root_16 = $.from_html(`<div>col-5</div>`);
var root_17 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_18 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_19 = $.from_html(`<div class="grid-example"><!></div>`);

export default function Grid_stories($$anchor) {
	const cell = 'grid-cell';
	const row = 'grid-row';

	Story($$anchor, {
		name: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var div = root_19();
			var node = $.child(div);

			Container(node, {
				fluid: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_18();
					var node_1 = $.first_child(fragment_1);

					Row(node_1, {
						noGutters: true,
						class: row,
						children: ($$anchor, $$slotProps) => {
							Col($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div_1 = root();

									$.set_class(div_1, 1, $.clsx(cell));
									$.append($$anchor, div_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Row(node_2, {
						noGutters: true,
						class: row,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_3 = $.first_child(fragment_3);

							Col(node_3, {
								children: ($$anchor, $$slotProps) => {
									var div_2 = root();

									$.set_class(div_2, 1, $.clsx(cell));
									$.append($$anchor, div_2);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Col(node_4, {
								children: ($$anchor, $$slotProps) => {
									var div_3 = root();

									$.set_class(div_3, 1, $.clsx(cell));
									$.append($$anchor, div_3);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							Col(node_5, {
								children: ($$anchor, $$slotProps) => {
									var div_4 = root();

									$.set_class(div_4, 1, $.clsx(cell));
									$.append($$anchor, div_4);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Col(node_6, {
								children: ($$anchor, $$slotProps) => {
									var div_5 = root();

									$.set_class(div_5, 1, $.clsx(cell));
									$.append($$anchor, div_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_2, 2);

					Row(node_7, {
						noGutters: true,
						class: row,
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_4();
							var node_8 = $.first_child(fragment_4);

							Col(node_8, {
								xs: '3',
								children: ($$anchor, $$slotProps) => {
									var div_6 = root_2();

									$.set_class(div_6, 1, $.clsx(cell));
									$.append($$anchor, div_6);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Col(node_9, {
								xs: 'auto',
								children: ($$anchor, $$slotProps) => {
									var div_7 = root_3();

									$.set_class(div_7, 1, $.clsx(cell));
									$.append($$anchor, div_7);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							Col(node_10, {
								xs: '3',
								children: ($$anchor, $$slotProps) => {
									var div_8 = root_2();

									$.set_class(div_8, 1, $.clsx(cell));
									$.append($$anchor, div_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_7, 2);

					Row(node_11, {
						noGutters: true,
						class: row,
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_6();
							var node_12 = $.first_child(fragment_5);

							Col(node_12, {
								xs: '6',
								children: ($$anchor, $$slotProps) => {
									var div_9 = root_5();

									$.set_class(div_9, 1, $.clsx(cell));
									$.append($$anchor, div_9);
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_12, 2);

							Col(node_13, {
								xs: '6',
								children: ($$anchor, $$slotProps) => {
									var div_10 = root_5();

									$.set_class(div_10, 1, $.clsx(cell));
									$.append($$anchor, div_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_11, 2);

					Row(node_14, {
						noGutters: true,
						class: row,
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_4();
							var node_15 = $.first_child(fragment_6);

							Col(node_15, {
								xs: '6',
								sm: '4',
								children: ($$anchor, $$slotProps) => {
									var div_11 = root_7();

									$.set_class(div_11, 1, $.clsx(cell));
									$.append($$anchor, div_11);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_15, 2);

							Col(node_16, {
								xs: '6',
								sm: '4',
								children: ($$anchor, $$slotProps) => {
									var div_12 = root_7();

									$.set_class(div_12, 1, $.clsx(cell));
									$.append($$anchor, div_12);
								},
								$$slots: { default: true }
							});

							var node_17 = $.sibling(node_16, 2);

							Col(node_17, {
								sm: '4',
								children: ($$anchor, $$slotProps) => {
									var div_13 = root_8();

									$.set_class(div_13, 1, $.clsx(cell));
									$.append($$anchor, div_13);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_14, 2);

					Row(node_18, {
						noGutters: true,
						class: row,
						children: ($$anchor, $$slotProps) => {
							Col($$anchor, {
								sm: { size: 6, order: 2, offset: 1 },
								children: ($$anchor, $$slotProps) => {
									var div_14 = root_9();

									$.set_class(div_14, 1, $.clsx(cell));
									$.append($$anchor, div_14);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					Row(node_19, {
						noGutters: true,
						class: row,
						children: ($$anchor, $$slotProps) => {
							Col($$anchor, {
								sm: '12',
								md: { size: 6, offset: 3 },
								children: ($$anchor, $$slotProps) => {
									var div_15 = root_10();

									$.set_class(div_15, 1, $.clsx(cell));
									$.append($$anchor, div_15);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_19, 2);

					Row(node_20, {
						noGutters: true,
						class: row,
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_6();
							var node_21 = $.first_child(fragment_9);

							Col(node_21, {
								sm: { size: 'auto', offset: 1 },
								children: ($$anchor, $$slotProps) => {
									var div_16 = root_11();

									$.set_class(div_16, 1, $.clsx(cell));
									$.append($$anchor, div_16);
								},
								$$slots: { default: true }
							});

							var node_22 = $.sibling(node_21, 2);

							Col(node_22, {
								sm: { size: 'auto', offset: 1 },
								children: ($$anchor, $$slotProps) => {
									var div_17 = root_12();

									$.set_class(div_17, 1, $.clsx(cell));
									$.append($$anchor, div_17);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});

					var node_23 = $.sibling(node_20, 2);

					Row(node_23, {
						cols: 2,
						class: row,
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_17();
							var node_24 = $.first_child(fragment_10);

							Col(node_24, {
								children: ($$anchor, $$slotProps) => {
									var div_18 = root_13();

									$.set_class(div_18, 1, $.clsx(cell));
									$.append($$anchor, div_18);
								},
								$$slots: { default: true }
							});

							var node_25 = $.sibling(node_24, 2);

							Col(node_25, {
								children: ($$anchor, $$slotProps) => {
									var div_19 = root_14();

									$.set_class(div_19, 1, $.clsx(cell));
									$.append($$anchor, div_19);
								},
								$$slots: { default: true }
							});

							var node_26 = $.sibling(node_25, 2);

							Col(node_26, {
								children: ($$anchor, $$slotProps) => {
									var div_20 = root_2();

									$.set_class(div_20, 1, $.clsx(cell));
									$.append($$anchor, div_20);
								},
								$$slots: { default: true }
							});

							var node_27 = $.sibling(node_26, 2);

							Col(node_27, {
								children: ($$anchor, $$slotProps) => {
									var div_21 = root_15();

									$.set_class(div_21, 1, $.clsx(cell));
									$.append($$anchor, div_21);
								},
								$$slots: { default: true }
							});

							var node_28 = $.sibling(node_27, 2);

							Col(node_28, {
								children: ($$anchor, $$slotProps) => {
									var div_22 = root_16();

									$.set_class(div_22, 1, $.clsx(cell));
									$.append($$anchor, div_22);
								},
								$$slots: { default: true }
							});

							var node_29 = $.sibling(node_28, 2);

							Col(node_29, {
								children: ($$anchor, $$slotProps) => {
									var div_23 = root_5();

									$.set_class(div_23, 1, $.clsx(cell));
									$.append($$anchor, div_23);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});

					var node_30 = $.sibling(node_23, 2);

					Row(node_30, {
						cols: { lg: 3, md: 2, sm: 1 },
						class: row,
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root_17();
							var node_31 = $.first_child(fragment_11);

							Col(node_31, {
								children: ($$anchor, $$slotProps) => {
									var div_24 = root_13();

									$.set_class(div_24, 1, $.clsx(cell));
									$.append($$anchor, div_24);
								},
								$$slots: { default: true }
							});

							var node_32 = $.sibling(node_31, 2);

							Col(node_32, {
								children: ($$anchor, $$slotProps) => {
									var div_25 = root_14();

									$.set_class(div_25, 1, $.clsx(cell));
									$.append($$anchor, div_25);
								},
								$$slots: { default: true }
							});

							var node_33 = $.sibling(node_32, 2);

							Col(node_33, {
								children: ($$anchor, $$slotProps) => {
									var div_26 = root_2();

									$.set_class(div_26, 1, $.clsx(cell));
									$.append($$anchor, div_26);
								},
								$$slots: { default: true }
							});

							var node_34 = $.sibling(node_33, 2);

							Col(node_34, {
								children: ($$anchor, $$slotProps) => {
									var div_27 = root_15();

									$.set_class(div_27, 1, $.clsx(cell));
									$.append($$anchor, div_27);
								},
								$$slots: { default: true }
							});

							var node_35 = $.sibling(node_34, 2);

							Col(node_35, {
								children: ($$anchor, $$slotProps) => {
									var div_28 = root_16();

									$.set_class(div_28, 1, $.clsx(cell));
									$.append($$anchor, div_28);
								},
								$$slots: { default: true }
							});

							var node_36 = $.sibling(node_35, 2);

							Col(node_36, {
								children: ($$anchor, $$slotProps) => {
									var div_29 = root_5();

									$.set_class(div_29, 1, $.clsx(cell));
									$.append($$anchor, div_29);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}