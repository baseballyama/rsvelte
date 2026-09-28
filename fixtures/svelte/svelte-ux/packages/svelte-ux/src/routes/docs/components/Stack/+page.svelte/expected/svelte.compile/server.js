import * as $ from 'svelte/internal/server';
import { mdiFilterVariant } from '@mdi/js';
import { Button, SectionDivider, Stack } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				horizontal: true,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Gap</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				horizontal: true,
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Justify</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				horizontal: true,
				justify: 'start',
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				horizontal: true,
				justify: 'center',
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				horizontal: true,
				justify: 'end',
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Template</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				horizontal: true,
				template: 'auto 1fr auto',
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SectionDivider($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Vertical`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				vertical: true,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Gap</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				vertical: true,
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Justify</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				vertical: true,
				justify: 'start',
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				vertical: true,
				justify: 'center',
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				vertical: true,
				justify: 'end',
				gap: 8,
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Template</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				vertical: true,
				template: 'auto 1fr auto',
				gap: 8,
				class: 'h-64',
				children: ($$renderer) => {
					$$renderer.push(`<div class="border">item</div> <div class="border">item</div> <div class="border">item</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SectionDivider($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Stack`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Default</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				stack: true,
				inline: true,
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Example`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="bg-danger rounded-full h-4 w-4 text-xs text-danger-content flex items-center justify-center">3</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Corner with Button</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				stack: true,
				inline: true,
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Example`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="bg-danger rounded-full h-4 w-4 -mr-1 -mt-1 text-xs text-danger-content flex items-center justify-center self-start justify-self-end">3</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Corner with Icon Button</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				stack: true,
				inline: true,
				children: ($$renderer) => {
					Button($$renderer, { variant: 'outline', icon: mdiFilterVariant, class: 'p-3' });
					$$renderer.push(`<!----> <div class="bg-danger rounded-full h-4 w-4 text-xs text-danger-content flex items-center justify-center self-start justify-self-end">3</div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Corner (multi) with Icon Button</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				stack: true,
				inline: true,
				children: ($$renderer) => {
					Button($$renderer, { variant: 'outline', icon: mdiFilterVariant, class: 'p-3' });
					$$renderer.push(`<!----> <div class="bg-danger rounded-full h-4 w-4 -mt-1 text-xs flex items-center justify-center self-start justify-self-end border border-surface-100"></div> <div class="bg-success rounded-full h-4 w-4 text-xs flex items-center justify-center self-end justify-self-end border border-surface-100"></div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}