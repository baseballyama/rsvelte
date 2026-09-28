import * as $ from 'svelte/internal/server';
import { mdiCheck, mdiClose } from '@mdi/js';
import { Button, Icon, Switch } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let checked = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2">`);
				Switch($$renderer, {});
				$$renderer.push(`<!----> `);
				Switch($$renderer, { checked: true });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Label</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2"><label class="flex gap-2 items-center text-sm">Click me `);
				Switch($$renderer, {});
				$$renderer.push(`<!----></label> <label class="flex gap-2 items-center text-sm">`);
				Switch($$renderer, {});
				$$renderer.push(`<!----> Click me</label></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icons</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2">`);

				Switch($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { checked }) => {
							if (checked) {
								$$renderer.push('<!--[0-->');
								Icon($$renderer, { data: mdiCheck, class: 'text-primary', size: '.8em' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Switch($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { checked }) => {
							if (checked) {
								$$renderer.push('<!--[0-->');
								Icon($$renderer, { data: mdiCheck, class: 'text-primary', size: '.8em' });
							} else {
								$$renderer.push('<!--[-1-->');
								Icon($$renderer, { data: mdiClose, class: 'text-surface-content', size: '.8em' });
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2">`);
				Switch($$renderer, { disabled: true });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { disabled: true, checked: true });
				$$renderer.push(`<!----> `);

				Switch($$renderer, {
					disabled: true,
					children: ($$renderer) => {
						Icon($$renderer, {
							data: mdiCheck,
							class: 'text-surface-content/50',
							size: '.8em'
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>checked=</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Switch($$renderer, {
					get checked() {
						return checked;
					},

					set checked($$value) {
						checked = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->reset`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Size</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2">`);
				Switch($$renderer, { size: 'sm' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { size: 'md' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { size: 'lg' });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Color</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="inline-grid grid-cols-[auto,auto] gap-2">`);
				Switch($$renderer, { color: 'primary' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { checked: true, color: 'primary' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { color: 'secondary' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { checked: true, color: 'secondary' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { color: 'accent' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { checked: true, color: 'accent' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { color: 'neutral' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { checked: true, color: 'neutral' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { color: 'success' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { checked: true, color: 'success' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { color: 'danger' });
				$$renderer.push(`<!----> `);
				Switch($$renderer, { checked: true, color: 'danger' });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom classes</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2">`);

				Switch($$renderer, {
					color: 'success',
					classes: {
						switch: 'data-[checked=false]:bg-danger data-[checked=false]:border-danger'
					}
				});

				$$renderer.push(`<!----> `);

				Switch($$renderer, {
					classes: {
						switch: 'bg-surface-100 border-surface-content/50',
						toggle: 'data-[checked=false]:bg-danger data-[checked=true]:bg-success'
					}
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}