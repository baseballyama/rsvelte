import * as $ from 'svelte/internal/server';
import { mdiDotsVertical } from '@mdi/js';
import { Avatar, Button, Card, Header, Settings } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Contents`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Title</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, { title: 'Title' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Title with subheading</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, { title: 'Title', subheading: 'Subheading' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Title as array</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, { title: ['One', 'Two', 'Three'] });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Title with subheading as array</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, { title: 'Title', subheading: ['One', 'Two', 'Three'] });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Header with Avatar</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, {
				$$slots: {
					header: ($$renderer) => {
						Header($$renderer, {
							title: 'Title',
							subheading: 'Subheading',
							slot: 'header',
							$$slots: {
								avatar: ($$renderer) => {
									$$renderer.push(`<div slot="avatar">`);

									Avatar($$renderer, {
										class: 'bg-primary text-primary-content font-bold',
										children: ($$renderer) => {
											$$renderer.push(`<!---->A`);
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

	$$renderer.push(`<!----> <h2>Header with Actions</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, {
				$$slots: {
					header: ($$renderer) => {
						Header($$renderer, {
							title: 'Title',
							subheading: 'Subheading',
							slot: 'header',
							$$slots: {
								actions: ($$renderer) => {
									$$renderer.push(`<div slot="actions">`);
									Button($$renderer, { icon: mdiDotsVertical, class: 'w-12 h-12' });
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

	$$renderer.push(`<!----> <h2>Header with Avatar &amp; Actions</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, {
				$$slots: {
					header: ($$renderer) => {
						Header($$renderer, {
							title: 'Title',
							subheading: 'Subheading',
							slot: 'header',
							$$slots: {
								avatar: ($$renderer) => {
									$$renderer.push(`<div slot="avatar">`);

									Avatar($$renderer, {
										class: 'bg-primary text-primary-content font-bold',
										children: ($$renderer) => {
											$$renderer.push(`<!---->A`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div>`);
								},

								actions: ($$renderer) => {
									$$renderer.push(`<div slot="actions">`);
									Button($$renderer, { icon: mdiDotsVertical, class: 'w-12 h-12' });
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

	$$renderer.push(`<!----> <h2>Contents slot</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, {
				title: 'Title',
				subheading: 'Subheading',
				$$slots: {
					contents: ($$renderer) => {
						$$renderer.push(`<div slot="contents">Contents</div>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Actions slot</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, {
				title: 'Title',
				subheading: 'Subheading',
				$$slots: {
					actions: ($$renderer) => {
						$$renderer.push(`<div slot="actions">`);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Action 1`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Action 2`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Actions slot alignment (always bottom)</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-3 gap-3">`);

			Card($$renderer, {
				title: 'Title',
				subheading: 'with actions',
				$$slots: {
					actions: ($$renderer) => {
						$$renderer.push(`<div slot="actions">`);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Action 1`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Action 2`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				title: 'Title',
				subheading: 'with content',
				$$slots: {
					contents: ($$renderer) => {
						$$renderer.push(`<div slot="contents" class="bg-danger/10">Contents</div>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				title: 'Title',
				subheading: 'with tall content',
				$$slots: {
					contents: ($$renderer) => {
						$$renderer.push(`<div slot="contents" class="bg-danger/10 h-40">Contents</div>`);
					}
				}
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Loading</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, { title: 'Title', loading: true });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>remove shadow</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Card($$renderer, {
				class: 'elevation-none',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Contents`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Settings</h2> `);

	Settings($$renderer, {
		components: {
			Card: {
				classes: {
					headerContainer: 'bg-surface-300 border-b',
					header: { title: 'text-3xl' }
				}
			}
		},

		children: ($$renderer) => {
			Card($$renderer, {
				title: 'Title',
				subheading: 'Subheading',
				$$slots: {
					contents: ($$renderer) => {
						$$renderer.push(`<div slot="contents">Contents</div>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}