import * as $ from 'svelte/internal/server';
import { colorScheme, Box, Button, Group, Container, Title, Text } from '@svelteuidev/core';
import { GithubLogo } from 'radix-icons-svelte';
import { ComponentsExample, Features, mobile, HomePageExample } from '$lib/components';
import { base } from '$app/paths';

export default function _page($$renderer) {
	var $$store_subs;
	const srcCodeButton = { m: 0, '&:hover': { textDecoration: 'none' } };
	const title = { fontFamily: 'var(--font)' };

	$.head('1vxeumv', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>SvelteUI - A variety of components, actions, transition and utility functions</title>`);
		});
	});

	Box($$renderer, {
		class: 'homepage_styles',
		children: ($$renderer) => {
			$$renderer.push(`<div class="container svelte-1vxeumv"><h1 class="title svelte-1vxeumv">Create applications in less time than ever before <br class="line-br svelte-1vxeumv"/> <span class="gradient-animation svelte-1vxeumv">Regardless of design experience</span></h1> <p class="content svelte-1vxeumv">SvelteUI includes more than 50+ customizable components. Check out the source code, or read
			the documentation &amp; get started!</p> `);

			Group($$renderer, {
				class: 'dark-theme',
				direction: $.store_get($$store_subs ??= {}, '$mobile', mobile) ? 'column' : 'row',
				position: 'center',
				children: ($$renderer) => {
					$$renderer.push(`<a${$.attr('href', `${$.stringify(base)}/introduction`)}>`);

					Button($$renderer, {
						fullSize: $.store_get($$store_subs ??= {}, '$mobile', mobile) ? true : false,
						size: 'xl',
						variant: 'gradient',
						gradient: { from: 'blue', to: 'cyan', deg: 45 },
						override: { '&:hover': { textDecoration: 'none' } },
						children: ($$renderer) => {
							Text($$renderer, {
								weight: 'bold',
								override: { color: 'white !important' },
								children: ($$renderer) => {
									$$renderer.push(`<!---->Get Started`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></a> <a href="https://github.com/svelteuidev/svelteui">`);

					Button($$renderer, {
						fullSize: $.store_get($$store_subs ??= {}, '$mobile', mobile) ? true : false,
						override: srcCodeButton,
						size: 'xl',
						color: $.store_get($$store_subs ??= {}, '$colorScheme', colorScheme) === 'dark' ? 'gray' : 'dark',
						children: ($$renderer) => {
							Text($$renderer, {
								weight: 'bold',
								color: 'white',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Source Code`);
								},
								$$slots: { default: true }
							});
						},

						$$slots: {
							default: true,
							leftIcon: ($$renderer) => {
								GithubLogo($$renderer, { size: 25, slot: 'leftIcon' });
							}
						}
					});

					$$renderer.push(`<!----></a>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Container($$renderer, {
				override: { py: '7rem' },
				size: 'xl',
				children: ($$renderer) => {
					Features($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Container($$renderer, {
				size: 'xl',
				children: ($$renderer) => {
					Title($$renderer, {
						weight: 'bold',
						override: { fontFamily: 'var(--font)', paddingBottom: '2rem' },
						align: 'center',
						children: ($$renderer) => {
							$$renderer.push(`<!---->40+ customizable components`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					ComponentsExample($$renderer, {});
					$$renderer.push(`<!----> `);

					Group($$renderer, {
						position: 'right',
						override: { pt: '1.5rem' },
						children: ($$renderer) => {
							$$renderer.push(`<!---->and many more...`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Container($$renderer, {
				override: { py: '7rem' },
				size: 'xl',
				children: ($$renderer) => {
					Title($$renderer, {
						override: title,
						weight: 'extrabold',
						tracking: 'tight',
						align: 'center',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Less Code. Elegant Solutions.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Text($$renderer, {
						size: 'xl',
						align: 'center',
						root: 'p',
						override: { lineHeight: '$md' },
						children: ($$renderer) => {
							$$renderer.push(`<!---->Spend less time writing UI code and more time building a great experience. <br/> Don't like what you see? Customize every component anyway you like!`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					HomePageExample($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Container($$renderer, {
				override: { py: '4rem' },
				size: 'xl',
				children: ($$renderer) => {
					Title($$renderer, {
						override: title,
						weight: 'extrabold',
						tracking: 'tight',
						align: 'center',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Ready to get started?`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Group($$renderer, {
						position: 'center',
						override: { mt: '$10' },
						direction: $.store_get($$store_subs ??= {}, '$mobile', mobile) ? 'column' : 'row',
						children: ($$renderer) => {
							$$renderer.push(`<a${$.attr('href', `${$.stringify(base)}/installation`)}>`);

							Button($$renderer, {
								fullSize: $.store_get($$store_subs ??= {}, '$mobile', mobile) ? true : false,
								size: 'lg',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Yes I am`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></a> <a${$.attr('href', `${$.stringify(base)}/introduction`)}>`);

							Button($$renderer, {
								fullSize: $.store_get($$store_subs ??= {}, '$mobile', mobile) ? true : false,
								size: 'lg',
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->I'd like to learn more`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></a>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}