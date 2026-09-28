import 'svelte/internal/disclose-version';
import Pagination from './Pagination.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { PaginationItem, PaginationLink } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Pagination',
	component: Pagination,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		ariaLabel: { control: 'text' },
		class: { className: 'string', table: { disable: true } },
		listClassName: { control: 'text' },
		size: { control: { type: 'select' }, options: ['', 'sm', 'lg'] },
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
		ariaLabel: 'Page navigation example',
		listClassName: '',
		size: '',
		theme: null
	}
};

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="vertical gap-xl"><!> <!></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Pagination_stories($$anchor) {
	var fragment = root_3();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Pagination($$anchor, $.spread_props(() => $.get(args), {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						PaginationItem(node_1, {
							disabled: true,
							children: ($$anchor, $$slotProps) => {
								PaginationLink($$anchor, { first: true, href: '#' });
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						PaginationItem(node_2, {
							disabled: true,
							children: ($$anchor, $$slotProps) => {
								PaginationLink($$anchor, { previous: true, href: '#' });
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						PaginationItem(node_3, {
							active: true,
							children: ($$anchor, $$slotProps) => {
								PaginationLink($$anchor, {
									href: '#',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('1');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						PaginationItem(node_4, {
							children: ($$anchor, $$slotProps) => {
								PaginationLink($$anchor, {
									href: '#',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('2');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						PaginationItem(node_5, {
							children: ($$anchor, $$slotProps) => {
								PaginationLink($$anchor, {
									href: '#',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('3');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						PaginationItem(node_6, {
							children: ($$anchor, $$slotProps) => {
								PaginationLink($$anchor, {
									href: '#',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('4');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_6, 2);

						PaginationItem(node_7, {
							children: ($$anchor, $$slotProps) => {
								PaginationLink($$anchor, {
									href: '#',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('5');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_7, 2);

						PaginationItem(node_8, {
							children: ($$anchor, $$slotProps) => {
								PaginationLink($$anchor, { next: true, href: '#' });
							},
							$$slots: { default: true }
						});

						var node_9 = $.sibling(node_8, 2);

						PaginationItem(node_9, {
							children: ($$anchor, $$slotProps) => {
								PaginationLink($$anchor, { last: true, href: '#' });
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

	var node_10 = $.sibling(node, 2);

	Story(node_10, { name: 'Basic' });

	var node_11 = $.sibling(node_10, 2);

	Story(node_11, {
		name: 'Sizes',
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				size: 'lg',
				ariaLabel: 'Page navigation example',
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root_1();
					var node_12 = $.first_child(fragment_13);

					PaginationItem(node_12, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { first: true, href: '#' });
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					PaginationItem(node_13, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { previous: true, href: '#' });
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					PaginationItem(node_14, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('1');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					PaginationItem(node_15, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('2');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					PaginationItem(node_16, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('3');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					PaginationItem(node_17, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { next: true, href: '#' });
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					PaginationItem(node_18, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { last: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_11, 2);

	Story(node_19, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node_20 = $.child(div);

			Pagination(node_20, {
				theme: 'dark',
				ariaLabel: 'Dark page navigation example',
				children: ($$anchor, $$slotProps) => {
					var fragment_21 = root_1();
					var node_21 = $.first_child(fragment_21);

					PaginationItem(node_21, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { first: true, href: '#' });
						},
						$$slots: { default: true }
					});

					var node_22 = $.sibling(node_21, 2);

					PaginationItem(node_22, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { previous: true, href: '#' });
						},
						$$slots: { default: true }
					});

					var node_23 = $.sibling(node_22, 2);

					PaginationItem(node_23, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('1');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_24 = $.sibling(node_23, 2);

					PaginationItem(node_24, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('2');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_24, 2);

					PaginationItem(node_25, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('3');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_26 = $.sibling(node_25, 2);

					PaginationItem(node_26, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { next: true, href: '#' });
						},
						$$slots: { default: true }
					});

					var node_27 = $.sibling(node_26, 2);

					PaginationItem(node_27, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { last: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_21);
				},
				$$slots: { default: true }
			});

			var node_28 = $.sibling(node_20, 2);

			Pagination(node_28, {
				theme: 'light',
				ariaLabel: 'Light page navigation example',
				children: ($$anchor, $$slotProps) => {
					var fragment_29 = root_1();
					var node_29 = $.first_child(fragment_29);

					PaginationItem(node_29, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { first: true, href: '#' });
						},
						$$slots: { default: true }
					});

					var node_30 = $.sibling(node_29, 2);

					PaginationItem(node_30, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { previous: true, href: '#' });
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_30, 2);

					PaginationItem(node_31, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('1');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_32 = $.sibling(node_31, 2);

					PaginationItem(node_32, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('2');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_33 = $.sibling(node_32, 2);

					PaginationItem(node_33, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('3');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_34 = $.sibling(node_33, 2);

					PaginationItem(node_34, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { next: true, href: '#' });
						},
						$$slots: { default: true }
					});

					var node_35 = $.sibling(node_34, 2);

					PaginationItem(node_35, {
						children: ($$anchor, $$slotProps) => {
							PaginationLink($$anchor, { last: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_29);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}