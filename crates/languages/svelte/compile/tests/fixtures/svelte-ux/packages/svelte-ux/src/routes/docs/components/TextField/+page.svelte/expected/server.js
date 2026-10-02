import * as $ from 'svelte/internal/server';

import {
	mdiCurrencyUsd,
	mdiPercent,
	mdiAccountSearch,
	mdiCreditCardOutline,
	mdiArrowRight,
	mdiRefresh,
	mdiMagnify,
	mdiStarOutline,
	mdiInformationOutline,
	mdiChevronLeft,
	mdiChevronRight,
	mdiCalendar,
	mdiMinus,
	mdiPlus
} from '@mdi/js';

import { Button, Icon, SectionDivider, TextField } from 'svelte-ux';
import { autoHeight, debounceEvent } from '@layerstack/svelte-actions';
import Preview from '$lib/components/Preview.svelte';
import Blockquote from '$docs/Blockquote.svelte';
import Toggle from '$lib/components/Toggle.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const numberOperators = [
			{ label: '=', value: 'equal' },
			{ label: '!=', value: 'notEqual' },
			{ label: '>', value: 'greaterThan' },
			{ label: '>=', value: 'greaterThanOrEqual' },
			{ label: '<', value: 'lessThan' },
			{ label: '<=', value: 'lessThanOrEqual' }
		];

		const stringOperators = [
			{ label: 'equals', value: 'equal' },
			{ label: 'starts', value: 'startsWith' },
			{ label: 'ends', value: 'endsWith' },
			{ label: 'contains', value: 'contains' }
		];

		let value = '';
		let numberValue = 1;
		let multilineValue = 'one\ntwo\nthree';
		let inputEl = null;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1>Examples</h1> <h2>Label only</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-flow-col gap-2">`);
					TextField($$renderer, { label: 'First Name' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'Last Name' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Placeholder only</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-flow-col gap-2">`);
					TextField($$renderer, { placeholder: 'First Name' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { placeholder: 'Last Name' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Label with placeholder</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-flow-col gap-2">`);

					TextField($$renderer, {
						label: 'First Name',
						placeholder: 'Please enter your first name'
					});

					$$renderer.push(`<!----> `);

					TextField($$renderer, {
						label: 'Last Name',
						placeholder: 'Please enter your last name'
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Error</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Password',
						placeholder: 'Please enter your password',
						error: true
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Error message</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Password',
						placeholder: 'Please enter your password',
						error: 'This is a required field'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Dense inline label</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-flow-col gap-2">`);

					TextField($$renderer, {
						label: 'First Name',
						placeholder: 'Please enter your first name',
						dense: true
					});

					$$renderer.push(`<!----> `);

					TextField($$renderer, {
						label: 'Last Name',
						placeholder: 'Please enter your last name',
						dense: true
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Float label</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-flow-col gap-2">`);
					TextField($$renderer, { label: 'First Name', labelPlacement: 'float' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'Last Name', labelPlacement: 'float' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Float label with placeholder</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-flow-col gap-2">`);

					TextField($$renderer, {
						label: 'First Name',
						labelPlacement: 'float',
						placeholder: 'Please enter your first name'
					});

					$$renderer.push(`<!----> `);

					TextField($$renderer, {
						label: 'Last Name',
						labelPlacement: 'float',
						placeholder: 'Please enter your last name'
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Top label</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-flow-col gap-2">`);
					TextField($$renderer, { label: 'First Name', labelPlacement: 'top' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'Last Name', labelPlacement: 'top' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Top label with placeholder</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-flow-col gap-2">`);

					TextField($$renderer, {
						label: 'First Name',
						labelPlacement: 'top',
						placeholder: 'Please enter your first name'
					});

					$$renderer.push(`<!----> `);

					TextField($$renderer, {
						label: 'Last Name',
						labelPlacement: 'top',
						placeholder: 'Please enter your last name'
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Top label with error</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Password',
						labelPlacement: 'top',
						placeholder: 'Please enter your password',
						error: 'This is a required field'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Left label</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-flow-col gap-2">`);
					TextField($$renderer, { label: 'First Name', labelPlacement: 'left' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'Last Name', labelPlacement: 'left' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Left label with placeholder</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-flow-col gap-2">`);

					TextField($$renderer, {
						label: 'First Name',
						labelPlacement: 'left',
						placeholder: 'Please enter your first name'
					});

					$$renderer.push(`<!----> `);

					TextField($$renderer, {
						label: 'Last Name',
						labelPlacement: 'left',
						placeholder: 'Please enter your last name'
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Left label with error</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Password',
						labelPlacement: 'left',
						placeholder: 'Please enter your password',
						error: 'This is a required field'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Hint</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Password', hint: 'At least 8 characters' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Disabled</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Name', disabled: true });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>on:change event</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Name' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>debounceChange</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid gap-2">`);
					TextField($$renderer, { label: 'Name', debounceChange: true });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'Name', debounceChange: 1000 });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Actions</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Name',
						actions: (node) => [
							debounceEvent(node, {
								type: 'input',
								listener: (e) => {
									// @ts-expect-error
									console.log(e.target.value);
								},
								timeout: 500
							})
						]
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>bind:inputEl</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid gap-2 justify-start">`);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Manually Focus`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toggle($$renderer, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { on: multiline, toggle }) => {
								Button($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(multiline ? 'To single line' : 'To multiline')}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								TextField($$renderer, {
									label: 'Name',
									multiline,
									get inputEl() {
										return inputEl;
									},

									set inputEl($$value) {
										inputEl = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!---->`);
							}
						}
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SectionDivider($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Type`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Input types</h2> <h3>Sets input type and add prefix/suffix when appropriate</h3> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid grid-cols-3 gap-2">`);
					TextField($$renderer, { label: 'default' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'text', type: 'text' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'password', type: 'password' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'integer', type: 'integer' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'decimal', type: 'decimal' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'currency', type: 'currency' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'percent', type: 'percent' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'email', type: 'email' });
					$$renderer.push(`<!----> `);
					TextField($$renderer, { label: 'search', type: 'search' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SectionDivider($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Adornments`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="grid grid-flow-col gap-2"><div><div class="text-lg font-semibold mt-8 ml-2">Prepend</div> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'User Search',
						$$slots: {
							prepend: ($$renderer) => {
								$$renderer.push(`<div slot="prepend">`);

								Icon($$renderer, {
									data: mdiAccountSearch,
									class: 'text-surface-content/50 mr-2'
								});

								$$renderer.push(`<!----></div>`);
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div><div class="text-lg font-semibold mt-8 ml-2">Prepend with select</div> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Start Date',
						$$slots: {
							prepend: ($$renderer) => {
								$$renderer.push(`<div slot="prepend"><select class="appearance-none bg-surface-content/5 border rounded-full mr-2 px-4" style="text-align-last: center;">`);
								$$renderer.option({}, '=');
								$$renderer.option({}, '!=');
								$$renderer.option({}, '>');
								$$renderer.option({}, '>=');
								$$renderer.option({}, '<');
								$$renderer.option({}, '<=');
								$$renderer.push(`</select></div>`);
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <h2>Append</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Name',
						$$slots: {
							append: ($$renderer) => {
								$$renderer.push(`<span slot="append">`);
								Button($$renderer, { icon: mdiRefresh, class: 'text-surface-content/50 p-2' });
								$$renderer.push(`<!----></span>`);
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Prefix</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Amount',
						$$slots: {
							prefix: ($$renderer) => {
								$$renderer.push(`<div slot="prefix">`);

								Icon($$renderer, {
									data: mdiCurrencyUsd,
									size: '1.1em',
									class: 'text-surface-content/50 -mt-1'
								});

								$$renderer.push(`<!----></div>`);
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="grid grid-flow-col gap-2"><div><div class="text-lg font-semibold mt-8 ml-2">Suffix</div> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Weight',
						$$slots: {
							suffix: ($$renderer) => {
								$$renderer.push(`<div slot="suffix" class="text-surface-content/50">lbs</div>`);
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div><div class="text-lg font-semibold mt-8 ml-2">Suffix with align right</div> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Ratio',
						align: 'right',
						$$slots: {
							suffix: ($$renderer) => {
								$$renderer.push(`<div slot="suffix">`);

								Icon($$renderer, {
									data: mdiPercent,
									size: '1.1em',
									class: 'text-surface-content/50 -mt-1 ml-1'
								});

								$$renderer.push(`<!----></div>`);
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <h2>Icon with convienent prepend</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Search', icon: mdiMagnify });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Icon with convienent append</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Search', iconRight: mdiMagnify });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Clearable with convienent append</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Search', clearable: true });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Clearable with additional append</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Search',
						clearable: true,
						$$slots: {
							append: ($$renderer) => {
								$$renderer.push(`<span slot="append">`);
								Button($$renderer, { icon: mdiArrowRight, class: 'text-surface-content/50 p-2' });
								$$renderer.push(`<!----></span>`);
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Operators with number</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Search',
						operators: numberOperators,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Operators with string</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Search', operators: stringOperators });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>All adornments</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Transfer amount',
						$$slots: {
							prepend: ($$renderer) => {
								$$renderer.push(`<div slot="prepend">`);

								Icon($$renderer, {
									data: mdiCreditCardOutline,
									class: 'text-surface-content/50 mr-2'
								});

								$$renderer.push(`<!----></div>`);
							},

							append: ($$renderer) => {
								$$renderer.push(`<div slot="append">`);
								Button($$renderer, { icon: mdiArrowRight, class: 'text-surface-content/50 p-2' });
								$$renderer.push(`<!----></div>`);
							},

							prefix: ($$renderer) => {
								$$renderer.push(`<div slot="prefix">`);

								Icon($$renderer, {
									data: mdiCurrencyUsd,
									size: '1.1em',
									class: 'text-surface-content/50 -mt-1'
								});

								$$renderer.push(`<!----></div>`);
							},

							suffix: ($$renderer) => {
								$$renderer.push(`<div slot="suffix" class="text-surface-content/50">usd</div>`);
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Multi Prepend/Append</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Date Range',
						$$slots: {
							prepend: ($$renderer) => {
								$$renderer.push(`<div slot="prepend">`);
								Button($$renderer, { icon: mdiChevronLeft, class: 'text-surface-content/50 p-2' });
								$$renderer.push(`<!----> `);
								Icon($$renderer, { data: mdiCalendar, class: 'text-surface-content/50 mr-2' });
								$$renderer.push(`<!----></div>`);
							},

							append: ($$renderer) => {
								$$renderer.push(`<div slot="append">`);
								Icon($$renderer, { data: mdiRefresh, class: 'text-surface-content/50 mr-2' });
								$$renderer.push(`<!----> `);
								Button($$renderer, { icon: mdiChevronRight, class: 'text-surface-content/50 p-2' });
								$$renderer.push(`<!----></div>`);
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SectionDivider($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Multiline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Multiline</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Comment', multiline: true });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Multiline with placeholder</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Comment',
						multiline: true,
						placeholder: 'Please leave a comment'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Multiline with autoHeight</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Comment',
						multiline: true,
						actions: (node) => {
							// @ts-expect-error
							return [autoHeight(node)];
						},

						get value() {
							return multilineValue;
						},

						set value($$value) {
							multilineValue = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Multiline with fixed height</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						label: 'Comment',
						multiline: true,
						classes: { input: 'h-[100px]' }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SectionDivider($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Mask &amp; Accept`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Date</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { mask: 'mm/dd/yyyy', replace: 'dmyh' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Telephone</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { mask: '+1 (___) ___-____', replace: '_' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>\`accept\` without \`mask\`</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Zip code', accept: /[0-9]{0,5}/ });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Blockquote($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->See <a href="./Input" class="font-semibold">Input</a> for more mask examples`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SectionDivider($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Style`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Rounded</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Search', rounded: true });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Rounded with icon</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, { label: 'Search', rounded: true, icon: mdiMagnify });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			SectionDivider($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Examples`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Address bar</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						icon: mdiInformationOutline,
						$$slots: {
							prefix: ($$renderer) => {
								$$renderer.push(`<div slot="prefix" class="text-surface-content/50">http://</div>`);
							},

							append: ($$renderer) => {
								$$renderer.push(`<div slot="append">`);
								Button($$renderer, { icon: mdiStarOutline, class: 'text-surface-content/50 p-2' });
								$$renderer.push(`<!----></div>`);
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Number stepper</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					TextField($$renderer, {
						type: 'integer',
						align: 'center',
						class: 'w-24',
						get value() {
							return numberValue;
						},

						set value($$value) {
							numberValue = $$value;
							$$settled = false;
						},

						$$slots: {
							prepend: ($$renderer) => {
								$$renderer.push(`<div slot="prepend" class="flex">`);
								Button($$renderer, { icon: mdiMinus, size: 'sm' });
								$$renderer.push(`<!----></div>`);
							},

							append: ($$renderer) => {
								$$renderer.push(`<div slot="append" class="flex">`);
								Button($$renderer, { icon: mdiPlus, size: 'sm' });
								$$renderer.push(`<!----></div>`);
							}
						}
					});
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
	});
}