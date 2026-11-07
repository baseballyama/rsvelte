import * as $ from 'svelte/internal/server';
import { Field, Input, SectionDivider } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let value = 'test';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Date</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { mask: 'mm/dd/yyyy', replace: 'dmyh' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Date time</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { mask: 'mm/dd/yyyy hh:mm', replace: 'dmyh' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Telephone</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { mask: '+1 (___) ___-____', replace: '_' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Credit Card</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { mask: '.... .... .... ....', replace: '.', accept: '\\d' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>MAC Address</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { mask: 'XX:XX:XX:XX:XX:XX', replace: 'X', accept: '[\\dA-F]' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Alphanumeric</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { mask: '__-__-__-____', replace: '_', accept: '\\w' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		SectionDivider($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Props`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Formatted \`value\`</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { mask: 'mm/dd/yyyy', replace: 'dmyh', value: '03/30/1982' });
				$$renderer.push(`<!----> `);

				Input($$renderer, {
					mask: '+1 (___) ___-____',
					replace: '_',
					value: '+1 (234) 567-8901'
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					mask: '+1 (___) ___-____',
					replace: '_',
					value: '(234) 567-8901'
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Unformatted \`value\`</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { mask: 'mm/dd/yyyy', replace: 'dmyh', value: '03301982' });
				$$renderer.push(`<!----> `);
				Input($$renderer, { mask: '+1 (___) ___-____', replace: '_', value: '2345678901' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Different (but compatible) \`value\` format</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, {
					mask: '+1 (___) ___-____',
					replace: '_',
					value: '234-567-8901'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Partial \`value\`</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { mask: 'mm/dd/yyyy', replace: 'dmyh', value: '03/30' });
				$$renderer.push(`<!----> `);
				Input($$renderer, { mask: '+1 (___) ___-____', replace: '_', value: '234' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Change event</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, { mask: 'mm/dd/yyyy', replace: 'dmyh' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>With Field</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'Birth Date',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Input($$renderer, { id, mask: 'mm/dd/yyyy', replace: 'dmyh' });
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Placeholder</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Input($$renderer, {
					placeholder: 'Please enter your birthday',
					mask: 'mm/dd/yyyy',
					replace: 'dmyh'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>bind:value</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-cols-[60px,auto]"><span class="font-semibold">Input:</span> `);

				Input($$renderer, {
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <span class="font-semibold">input:</span> <input${$.attr('value', value)}/></div>`);
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