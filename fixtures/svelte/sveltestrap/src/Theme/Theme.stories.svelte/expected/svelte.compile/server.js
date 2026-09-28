import * as $ from 'svelte/internal/server';
import { Story } from '@storybook/addon-svelte-csf';

import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	CardSubtitle,
	CardText,
	CardTitle,
	Toast,
	ThemeToggler,
	Icon,
	colorMode,
	useColorMode
} from '@sveltestrap/sveltestrap';

import Theme from './Theme.svelte';

export const meta = { title: 'Stories/Theme', component: Theme };

export default function Theme_stories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		Story($$renderer, {
			name: 'Basic',
			children: ($$renderer) => {
				Theme($$renderer, {
					theme: 'dark',
					children: ($$renderer) => {
						Card($$renderer, {
							class: 'mb-3',
							children: ($$renderer) => {
								CardHeader($$renderer, {
									children: ($$renderer) => {
										CardTitle($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Dark Theme`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								CardBody($$renderer, {
									children: ($$renderer) => {
										CardSubtitle($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Card subtitle`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										CardText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Some quick example text to build on the card title and make up the bulk of the card's content.`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Button`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								CardFooter($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Footer`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Toast($$renderer, {
							body: true,
							header: 'Dark Theme',
							style: '--bs-toast-color: #fff;',
							isOpen: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Hook',
			children: ($$renderer) => {
				Button($$renderer, {
					color: 'primary',
					outline: true,
					active: $.store_get($$store_subs ??= {}, '$colorMode', colorMode) === 'light',
					children: ($$renderer) => {
						$$renderer.push(`<!---->light `);
						Icon($$renderer, { name: 'sun-fill' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					color: 'primary',
					outline: true,
					active: $.store_get($$store_subs ??= {}, '$colorMode', colorMode) === 'dark',
					children: ($$renderer) => {
						$$renderer.push(`<!---->dark `);
						Icon($$renderer, { name: 'moon-stars-fill' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					color: 'primary',
					outline: true,
					active: $.store_get($$store_subs ??= {}, '$colorMode', colorMode) === 'auto',
					children: ($$renderer) => {
						$$renderer.push(`<!---->auto `);
						Icon($$renderer, { name: 'circle-half' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Store',
			children: ($$renderer) => {
				Button($$renderer, {
					color: 'primary',
					outline: true,
					active: $.store_get($$store_subs ??= {}, '$colorMode', colorMode) === 'light',
					children: ($$renderer) => {
						$$renderer.push(`<!---->light `);
						Icon($$renderer, { name: 'sun-fill' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					color: 'primary',
					outline: true,
					active: $.store_get($$store_subs ??= {}, '$colorMode', colorMode) === 'dark',
					children: ($$renderer) => {
						$$renderer.push(`<!---->dark `);
						Icon($$renderer, { name: 'moon-stars-fill' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					color: 'primary',
					outline: true,
					active: $.store_get($$store_subs ??= {}, '$colorMode', colorMode) === 'auto',
					children: ($$renderer) => {
						$$renderer.push(`<!---->auto `);
						Icon($$renderer, { name: 'circle-half' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Toggler',
			children: ($$renderer) => {
				ThemeToggler($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { currentColorMode, toggleColorMode }) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Toggle Theme: ${$.escape(currentColorMode)}`);
								},
								$$slots: { default: true }
							});
						}
					}
				});

				$$renderer.push(`<!----> `);

				Card($$renderer, {
					class: 'mt-3',
					children: ($$renderer) => {
						CardHeader($$renderer, {
							children: ($$renderer) => {
								CardTitle($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Dark Theme`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						CardBody($$renderer, {
							children: ($$renderer) => {
								CardSubtitle($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Card subtitle`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								CardText($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Some quick example text to build on the card title and make up the bulk of the card's content.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Button`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						CardFooter($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Footer`);
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

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}