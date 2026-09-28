import * as $ from 'svelte/internal/server';
import { mdiTrashCan } from '@mdi/js';
import { Button, Tooltip } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Button</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				title: 'Hello',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hover me`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Icon button</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				title: 'Click to remove',
				children: ($$renderer) => {
					Button($$renderer, { icon: mdiTrashCan, class: 'w-12 h-12' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Slot w/ custom markup</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hover me`);
						},
						$$slots: { default: true }
					});
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						$$renderer.push(`<div slot="title" class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 bg-surface-content text-surface-100 px-4 py-2 text-xs rounded shadow"><div class="col-span-2 justify-self-center text-sm font-semibold">Tue, March 30</div> <div class="text-surface-100/50 justify-self-end">Actual:</div> <div class="justify-self-end">123.50</div> <div class="text-surface-100/50 justify-self-end">Target:</div> <div class="justify-self-end">90.00</div> <div class="text-surface-100/50 justify-self-end">Variance:</div> <div class="justify-self-end">33.50</div></div>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Placement</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				title: 'Hello',
				placement: 'left',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Left`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'Hello',
				placement: 'top',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Top`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'Hello',
				placement: 'bottom',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bottom`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'Hello',
				placement: 'right',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Right`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Offset</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				title: 'Hello',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hover me`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'Hello',
				offset: 2,
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hover me`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'Hello',
				offset: 4,
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hover me`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'Hello',
				offset: 8,
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hover me`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Overlap</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				title: 'Hello',
				offset: -8,
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hover me`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Underline &amp; cursor</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				title: 'Hello',
				underline: true,
				cursor: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Hover me`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}