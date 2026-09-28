import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Accordion } from './index';

export default function Accordion_stories($$renderer) {
	let value = 'typescript';

	Meta($$renderer, { title: 'Components/Accordion', component: Accordion });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Accordion($$renderer, $.spread_props([
					args,
					{
						defaultValue: 'typescript',
						children: ($$renderer) => {
							if (Accordion.Item) {
								$$renderer.push('<!--[-->');

								Accordion.Item($$renderer, {
									value: 'typescript',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Build type safe applications. All SvelteUI packages are built with TypeScript and support it by
			default. All components and functions export types, are documented, and give developers autocomplete
			features!`);
									},

									$$slots: {
										default: true,
										control: ($$renderer) => {
											$$renderer.push(`<div slot="control">Typescript Based</div>`);
										}
									}
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Accordion.Item) {
								$$renderer.push('<!--[-->');

								Accordion.Item($$renderer, {
									value: 'packed',
									children: ($$renderer) => {
										$$renderer.push(`<!---->SvelteUI contains more than just components. With Actions, Transitions, and Utilities available
			to you, development will be fun and easy!`);
									},

									$$slots: {
										default: true,
										control: ($$renderer) => {
											$$renderer.push(`<div slot="control">Feature packed</div>`);
										}
									}
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Accordion.Item) {
								$$renderer.push('<!--[-->');

								Accordion.Item($$renderer, {
									value: 'accessible',
									children: ($$renderer) => {
										$$renderer.push(`<!---->All components are accessible according to WAI-ARIA standards. On top of that, no annoying focus
			ring. It will appear only when user navigates with keyboard.`);
									},

									$$slots: {
										default: true,
										control: ($$renderer) => {
											$$renderer.push(`<div slot="control">Accessible and usable</div>`);
										}
									}
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Accordion', id: 'accordionStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Multiple Tabs Open',
		id: 'accordionMultipleStory',
		args: { multiple: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Disabled Tabs',
		id: 'accordionDisabledStory',
		children: ($$renderer) => {
			Accordion($$renderer, {
				defaultValue: 'typescript',
				children: ($$renderer) => {
					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: 'typescript',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Build type safe applications. All SvelteUI packages are built with TypeScript and support it by
			default. All components and functions export types, are documented, and give developers autocomplete
			features!`);
							},

							$$slots: {
								default: true,
								control: ($$renderer) => {
									$$renderer.push(`<div slot="control">Typescript Based</div>`);
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: 'packed',
							disabled: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->SvelteUI contains more than just components. With Actions, Transitions, and Utilities available
			to you, development will be fun and easy!`);
							},

							$$slots: {
								default: true,
								control: ($$renderer) => {
									$$renderer.push(`<div slot="control">Feature packed</div>`);
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: 'accessible',
							children: ($$renderer) => {
								$$renderer.push(`<!---->All components are accessible according to WAI-ARIA standards. On top of that, no annoying focus
			ring. It will appear only when user navigates with keyboard.`);
							},

							$$slots: {
								default: true,
								control: ($$renderer) => {
									$$renderer.push(`<div slot="control">Accessible and usable</div>`);
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Multiple Tabs Open With Default',
		id: 'accordionMultipleDefaultStory',
		children: ($$renderer) => {
			Accordion($$renderer, {
				multiple: true,
				defaultValue: ['packed', 'accessible'],
				children: ($$renderer) => {
					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: 'typescript',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Build type safe applications. All SvelteUI packages are built with TypeScript and support it by
			default. All components and functions export types, are documented, and give developers autocomplete
			features!`);
							},

							$$slots: {
								default: true,
								control: ($$renderer) => {
									$$renderer.push(`<div slot="control">Typescript Based</div>`);
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: 'packed',
							children: ($$renderer) => {
								$$renderer.push(`<!---->SvelteUI contains more than just components. With Actions, Transitions, and Utilities available
			to you, development will be fun and easy!`);
							},

							$$slots: {
								default: true,
								control: ($$renderer) => {
									$$renderer.push(`<div slot="control">Feature packed</div>`);
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: 'accessible',
							children: ($$renderer) => {
								$$renderer.push(`<!---->All components are accessible according to WAI-ARIA standards. On top of that, no annoying focus
			ring. It will appear only when user navigates with keyboard.`);
							},

							$$slots: {
								default: true,
								control: ($$renderer) => {
									$$renderer.push(`<div slot="control">Accessible and usable</div>`);
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Controlled',
		id: 'accordionControlledStory',
		children: ($$renderer) => {
			$$renderer.push(`<button>Pick random</button> ${$.escape(value)} `);

			Accordion($$renderer, {
				value,
				children: ($$renderer) => {
					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: 'typescript',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Build type safe applications. All SvelteUI packages are built with TypeScript and support it by
			default. All components and functions export types, are documented, and give developers autocomplete
			features!`);
							},

							$$slots: {
								default: true,
								control: ($$renderer) => {
									$$renderer.push(`<div slot="control">Typescript Based</div>`);
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: 'packed',
							children: ($$renderer) => {
								$$renderer.push(`<!---->SvelteUI contains more than just components. With Actions, Transitions, and Utilities available
			to you, development will be fun and easy!`);
							},

							$$slots: {
								default: true,
								control: ($$renderer) => {
									$$renderer.push(`<div slot="control">Feature packed</div>`);
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: 'accessible',
							children: ($$renderer) => {
								$$renderer.push(`<!---->All components are accessible according to WAI-ARIA standards. On top of that, no annoying focus
			ring. It will appear only when user navigates with keyboard.`);
							},

							$$slots: {
								default: true,
								control: ($$renderer) => {
									$$renderer.push(`<div slot="control">Accessible and usable</div>`);
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Transition Duration (1s)',
		id: 'accordionTransitionDurationLongStory',
		args: { transitionDuration: 1000 }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Transition Duration (0s)',
		id: 'accordionNoTransitionDurationStory',
		args: { transitionDuration: 0 }
	});

	$$renderer.push(`<!---->`);
}