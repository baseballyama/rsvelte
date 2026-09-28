import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';
import { mdiChevronDown } from '@mdi/js';

import {
	Button,
	ButtonGroup,
	Dialog,
	Drawer,
	Menu,
	MenuItem,
	ToggleButton
} from 'svelte-ux';

import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Dialog</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ToggleButton($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open }) => {
						$$renderer.push(`<!---->Open Dialog`);
					},

					toggle: ($$renderer, { toggle, toggleOff }) => {
						Dialog($$renderer, {
							slot: 'toggle',
							open,
							$$slots: {
								title: ($$renderer) => {
									$$renderer.push(`<div slot="title">Are you sure you want to do that?</div>`);
								},

								actions: ($$renderer) => {
									$$renderer.push(`<div slot="actions">`);

									Button($$renderer, {
										variant: 'fill',
										color: 'primary',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Close`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div>`);
								}
							}
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Drawer</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ToggleButton($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Drawer`);
				},

				$$slots: {
					default: true,
					toggle: ($$renderer, { on: open, toggleOff }) => {
						Drawer($$renderer, {
							slot: 'toggle',
							open,
							class: 'w-[400px]',
							children: ($$renderer) => {
								$$renderer.push(`<h1>Contents</h1> <div class="fixed bottom-0 w-full flex justify-center bg-surface-content/5 border-t p-1">`);

								Button($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Close`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>slide transition</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ToggleButton($$renderer, {
				size: 'sm',
				transition: slide,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: showDetails }) => {
						$$renderer.push(`<!---->${$.escape(showDetails ? 'show less' : 'show more')}...`);
					},

					toggle: ($$renderer) => {
						$$renderer.push(`<div slot="toggle" class="mt-2 border-t"><!--[-->`);

						const each_array = $.ensure_array_like({ length: 10 });

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let _ = each_array[i];

							$$renderer.push(`<div>${$.escape(i)}</div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>slide transition (button after)</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ToggleButton($$renderer, {
				size: 'sm',
				transition: slide,
				buttonPlacement: 'after',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: showDetails }) => {
						$$renderer.push(`<!---->${$.escape(showDetails ? 'show less' : 'show more')}...`);
					},

					toggle: ($$renderer) => {
						$$renderer.push(`<div slot="toggle" class="mt-2 border-b"><!--[-->`);

						const each_array_1 = $.ensure_array_like({ length: 10 });

						for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
							let _ = each_array_1[i];

							$$renderer.push(`<div>${$.escape(i)}</div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>on by default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ToggleButton($$renderer, {
				on: true,
				size: 'sm',
				transition: slide,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: showDetails }) => {
						$$renderer.push(`<!---->${$.escape(showDetails ? 'show less' : 'show more')}...`);
					},

					toggle: ($$renderer) => {
						$$renderer.push(`<div slot="toggle" class="mt-2 border-t border-b"><!--[-->`);

						const each_array_2 = $.ensure_array_like({ length: 10 });

						for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
							let _ = each_array_2[i];

							$$renderer.push(`<div>${$.escape(i)}</div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>ButtonGroup</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ButtonGroup($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Click me`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToggleButton($$renderer, {
						icon: mdiChevronDown,
						iconOnly: true,
						rounded: true,
						class: 'px-1',
						transition: false,
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { on: open, toggleOff }) => {
								Menu($$renderer, {
									open,
									placement: 'bottom-start',
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->One`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Two`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Three`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}