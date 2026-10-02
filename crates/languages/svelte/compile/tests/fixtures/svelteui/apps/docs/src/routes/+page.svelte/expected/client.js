import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { colorScheme, Box, Button, Group, Container, Title, Text } from '@svelteuidev/core';
import { GithubLogo } from 'radix-icons-svelte';
import { ComponentsExample, Features, mobile, HomePageExample } from '$lib/components';
import { base } from '$app/paths';

var root = $.from_html(`<a><!></a> <a href="https://github.com/svelteuidev/svelteui"><!></a>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Spend less time writing UI code and more time building a great experience. <br/> Don't like what you see? Customize every component anyway you like!`, 1);
var root_3 = $.from_html(`<a><!></a> <a><!></a>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

var root_5 = $.from_html(
	`<div class="container svelte-1vxeumv"><h1 class="title svelte-1vxeumv">Create applications in less time than ever before <br class="line-br svelte-1vxeumv"/> <span class="gradient-animation svelte-1vxeumv">Regardless of design experience</span></h1> <p class="content svelte-1vxeumv">SvelteUI includes more than 50+ customizable components. Check out the source code, or read
			the documentation & get started!</p> <!></div> <!> <!> <!> <!>`,
	1
);

export default function _page($$anchor) {
	const $mobile = () => $.store_get(mobile, '$mobile', $$stores);
	const $colorScheme = () => $.store_get(colorScheme, '$colorScheme', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const srcCodeButton = { m: 0, '&:hover': { textDecoration: 'none' } };
	const title = { fontFamily: 'var(--font)' };

	$.head('1vxeumv', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'SvelteUI - A variety of components, actions, transition and utility functions';
		});
	});

	Box($$anchor, {
		class: 'homepage_styles',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var div = $.first_child(fragment_1);
			var node = $.sibling($.child(div), 4);

			{
				let $0 = $.derived(() => $mobile() ? 'column' : 'row');

				Group(node, {
					class: 'dark-theme',
					get direction() {
						return $.get($0);
					},
					position: 'center',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var a = $.first_child(fragment_2);
						var node_1 = $.child(a);

						{
							let $0 = $.derived(() => $mobile() ? true : false);

							Button(node_1, {
								get fullSize() {
									return $.get($0);
								},
								size: 'xl',
								variant: 'gradient',
								gradient: { from: 'blue', to: 'cyan', deg: 45 },
								override: { '&:hover': { textDecoration: 'none' } },
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										weight: 'bold',
										override: { color: 'white !important' },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Get Started');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}

						$.reset(a);

						var a_1 = $.sibling(a, 2);
						var node_2 = $.child(a_1);

						{
							let $0 = $.derived(() => $mobile() ? true : false);
							let $1 = $.derived(() => $colorScheme() === 'dark' ? 'gray' : 'dark');

							Button(node_2, {
								get fullSize() {
									return $.get($0);
								},

								get override() {
									return srcCodeButton;
								},
								size: 'xl',
								get color() {
									return $.get($1);
								},

								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										weight: 'bold',
										color: 'white',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Source Code');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								},

								$$slots: {
									default: true,
									leftIcon: ($$anchor, $$slotProps) => {
										GithubLogo($$anchor, { size: 25, slot: 'leftIcon' });
									}
								}
							});
						}

						$.reset(a_1);
						$.template_effect(() => $.set_attribute(a, 'href', `${base ?? ''}/introduction`));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div);

			var node_3 = $.sibling(div, 2);

			Container(node_3, {
				override: { py: '7rem' },
				size: 'xl',
				children: ($$anchor, $$slotProps) => {
					Features($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Container(node_4, {
				size: 'xl',
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_1();
					var node_5 = $.first_child(fragment_7);

					Title(node_5, {
						weight: 'bold',
						override: { fontFamily: 'var(--font)', paddingBottom: '2rem' },
						align: 'center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('40+ customizable components');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					ComponentsExample(node_6, {});

					var node_7 = $.sibling(node_6, 2);

					Group(node_7, {
						position: 'right',
						override: { pt: '1.5rem' },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('and many more...');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_4, 2);

			Container(node_8, {
				override: { py: '7rem' },
				size: 'xl',
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_1();
					var node_9 = $.first_child(fragment_8);

					Title(node_9, {
						get override() {
							return title;
						},
						weight: 'extrabold',
						tracking: 'tight',
						align: 'center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Less Code. Elegant Solutions.');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Text(node_10, {
						size: 'xl',
						align: 'center',
						root: 'p',
						override: { lineHeight: '$md' },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_9 = root_2();

							$.next(2);
							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					HomePageExample(node_11, {});
					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_8, 2);

			Container(node_12, {
				override: { py: '4rem' },
				size: 'xl',
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_4();
					var node_13 = $.first_child(fragment_10);

					Title(node_13, {
						get override() {
							return title;
						},
						weight: 'extrabold',
						tracking: 'tight',
						align: 'center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Ready to get started?');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					{
						let $0 = $.derived(() => $mobile() ? 'column' : 'row');

						Group(node_14, {
							position: 'center',
							override: { mt: '$10' },
							get direction() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_11 = root_3();
								var a_2 = $.first_child(fragment_11);
								var node_15 = $.child(a_2);

								{
									let $0 = $.derived(() => $mobile() ? true : false);

									Button(node_15, {
										get fullSize() {
											return $.get($0);
										},
										size: 'lg',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Yes I am');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								}

								$.reset(a_2);

								var a_3 = $.sibling(a_2, 2);
								var node_16 = $.child(a_3);

								{
									let $0 = $.derived(() => $mobile() ? true : false);

									Button(node_16, {
										get fullSize() {
											return $.get($0);
										},
										size: 'lg',
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('I\'d like to learn more');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});
								}

								$.reset(a_3);

								$.template_effect(() => {
									$.set_attribute(a_2, 'href', `${base ?? ''}/installation`);
									$.set_attribute(a_3, 'href', `${base ?? ''}/introduction`);
								});

								$.append($$anchor, fragment_11);
							},
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$$cleanup();
}