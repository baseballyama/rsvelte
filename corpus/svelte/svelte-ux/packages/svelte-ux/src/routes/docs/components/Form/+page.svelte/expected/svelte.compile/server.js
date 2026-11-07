import * as $ from 'svelte/internal/server';
import { z } from 'zod';
import { Button, Form, TextField } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let data = { name: 'Sean Lynch' };

		const schema = z.object({
			firstName: z.string().nonempty('First name is required').max(10),
			lastName: z.string().nonempty('Last name is required').max(10)
		});

		let schemaData = { firstName: '', lastName: '' };

		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Form($$renderer, {
					initial: data,
					children: $.invalid_default_snippet,
					$$slots: {
						default: (
							$$renderer,
							{
								draft,
								state,
								commit,
								revert,
								revertAll,
								undo,
								current,
								refresh
							}
						) => {
							TextField($$renderer, { label: 'Name', value: draft.name });
							$$renderer.push(`<!----> `);

							Button($$renderer, {
								disabled: current.name == null,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Apply`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Undo`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Reset`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div class="mt-2"><div>current: ${$.escape(JSON.stringify(current))}</div> <div>state: ${$.escape(JSON.stringify(state))}</div></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Form submit button</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Form($$renderer, {
					initial: data,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { draft, state }) => {
							TextField($$renderer, { label: 'Name', value: draft.name });
							$$renderer.push(`<!----> `);

							Button($$renderer, {
								type: 'submit',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Apply`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								type: 'reset',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div class="mt-2"><div>state: ${$.escape(JSON.stringify(state))}</div></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Form submit with method</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Form($$renderer, {
					method: 'post',
					initial: data,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { draft, state }) => {
							TextField($$renderer, { label: 'Name', value: draft.name });
							$$renderer.push(`<!----> `);

							Button($$renderer, {
								type: 'submit',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Apply`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								type: 'reset',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div class="mt-2"><div>state: ${$.escape(JSON.stringify(state))}</div></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>zod schema</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Form($$renderer, {
					initial: schemaData,
					schema,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { draft, state, errors }) => {
							$$renderer.push(`<div class="grid gap-2">`);

							TextField($$renderer, {
								label: 'First Name',
								value: draft.firstName,
								error: errors.firstName
							});

							$$renderer.push(`<!----> `);

							TextField($$renderer, {
								label: 'Last Name',
								value: draft.lastName,
								error: errors.lastName
							});

							$$renderer.push(`<!----></div> `);

							Button($$renderer, {
								type: 'submit',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Apply`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								type: 'reset',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div class="mt-2"><div>state: ${$.escape(JSON.stringify(state))}</div> <div>errors: ${$.escape(JSON.stringify(errors))}</div></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>zod schema with server submit</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Form($$renderer, {
					method: 'post',
					initial: schemaData,
					schema,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { draft, state, errors }) => {
							$$renderer.push(`<div class="grid gap-2">`);

							TextField($$renderer, {
								label: 'First Name',
								value: draft.firstName,
								error: errors.firstName
							});

							$$renderer.push(`<!----> `);

							TextField($$renderer, {
								label: 'Last Name',
								value: draft.lastName,
								error: errors.lastName
							});

							$$renderer.push(`<!----></div> `);

							Button($$renderer, {
								type: 'submit',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Apply`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								type: 'reset',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div class="mt-2"><div>state: ${$.escape(JSON.stringify(state))}</div> <div>errors: ${$.escape(JSON.stringify(errors))}</div></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}