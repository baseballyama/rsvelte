import 'svelte/internal/disclose-version';
import Card from './Card.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';

import {
	Button,
	CardBody,
	CardFooter,
	CardHeader,
	CardSubtitle,
	CardText,
	CardTitle
} from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Card',
	component: Card,
	parameters: { controls: { exclude: /^(click|default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		body: { control: 'boolean' },
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
		inverse: { control: 'boolean' },
		outline: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
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
		body: false,
		color: undefined,
		inverse: false,
		outline: false,
		theme: null
	}
};

var root = $.from_html(`<div class="card-example"><div class="card-width"><!></div></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="card-example"><div class="card-width"><!> <!> <!> <!> <!> <!> <!> <!></div></div>`);
var root_3 = $.from_html(`<div class="card-example vertical gap-lg"><div class="card-width"><!></div> <div class="card-width"><!></div></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Card_stories($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root();
				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				Card(node_1, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						CardBody($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Hello World');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				}));

				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Story(node_2, { name: 'Basic' });

	var node_3 = $.sibling(node_2, 2);

	Story(node_3, {
		name: 'Body',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root();
			var div_3 = $.child(div_2);
			var node_4 = $.child(div_3);

			Card(node_4, {
				body: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Goodbye Cruel World');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_3, 2);

	Story(node_5, {
		name: 'HeaderFooter',
		children: ($$anchor, $$slotProps) => {
			var div_4 = root();
			var div_5 = $.child(div_4);
			var node_6 = $.child(div_5);

			Card(node_6, {
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_7 = $.first_child(fragment_2);

					CardHeader(node_7, {
						children: ($$anchor, $$slotProps) => {
							CardTitle($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Card title');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					CardBody(node_8, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_9 = $.first_child(fragment_4);

							CardSubtitle(node_9, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Card subtitle');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							CardText(node_10, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Some quick example text to build on the card title and make up the bulk of the card\'s content.');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_10, 2);

							Button(node_11, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Button');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_8, 2);

					CardFooter(node_12, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Footer');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_5, 2);

	Story(node_13, {
		name: 'ColorInverse',
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_2();
			var div_7 = $.child(div_6);
			var node_14 = $.child(div_7);

			Card(node_14, {
				body: true,
				color: 'primary',
				inverse: true,
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Primary');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			Card(node_15, {
				body: true,
				color: 'secondary',
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Secondary');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_15, 2);

			Card(node_16, {
				body: true,
				color: 'success',
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Success');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			Card(node_17, {
				body: true,
				color: 'danger',
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Danger');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			Card(node_18, {
				body: true,
				color: 'warning',
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Warning');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			Card(node_19, {
				body: true,
				color: 'info',
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Info');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_19, 2);

			Card(node_20, {
				body: true,
				color: 'dark',
				inverse: true,
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Dark');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_21 = $.sibling(node_20, 2);

			Card(node_21, {
				body: true,
				color: 'light',
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Light');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);
			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_13, 2);

	Story(node_22, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var div_8 = root_3();
			var div_9 = $.child(div_8);
			var node_23 = $.child(div_9);

			Card(node_23, {
				theme: 'dark',
				class: 'mb-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_24 = $.first_child(fragment_5);

					CardHeader(node_24, {
						children: ($$anchor, $$slotProps) => {
							CardTitle($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_15 = $.text('Dark Theme');

									$.append($$anchor, text_15);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_24, 2);

					CardBody(node_25, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_1();
							var node_26 = $.first_child(fragment_7);

							CardSubtitle(node_26, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_16 = $.text('Card subtitle');

									$.append($$anchor, text_16);
								},
								$$slots: { default: true }
							});

							var node_27 = $.sibling(node_26, 2);

							CardText(node_27, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_17 = $.text('Some quick example text to build on the card title and make up the bulk of the card\'s content.');

									$.append($$anchor, text_17);
								},
								$$slots: { default: true }
							});

							var node_28 = $.sibling(node_27, 2);

							Button(node_28, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Button');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_29 = $.sibling(node_25, 2);

					CardFooter(node_29, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_19 = $.text('Footer');

							$.append($$anchor, text_19);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var node_30 = $.child(div_10);

			Card(node_30, {
				theme: 'light',
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_1();
					var node_31 = $.first_child(fragment_8);

					CardHeader(node_31, {
						children: ($$anchor, $$slotProps) => {
							CardTitle($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_20 = $.text('Light Theme');

									$.append($$anchor, text_20);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_32 = $.sibling(node_31, 2);

					CardBody(node_32, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_1();
							var node_33 = $.first_child(fragment_10);

							CardSubtitle(node_33, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_21 = $.text('Card subtitle');

									$.append($$anchor, text_21);
								},
								$$slots: { default: true }
							});

							var node_34 = $.sibling(node_33, 2);

							CardText(node_34, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_22 = $.text('Some quick example text to build on the card title and make up the bulk of the card\'s content.');

									$.append($$anchor, text_22);
								},
								$$slots: { default: true }
							});

							var node_35 = $.sibling(node_34, 2);

							Button(node_35, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_23 = $.text('Button');

									$.append($$anchor, text_23);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});

					var node_36 = $.sibling(node_32, 2);

					CardFooter(node_36, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_24 = $.text('Footer');

							$.append($$anchor, text_24);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			$.reset(div_10);
			$.reset(div_8);
			$.append($$anchor, div_8);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}