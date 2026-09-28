import * as $ from 'svelte/internal/server';

import {
	mdiCheck,
	mdiCreditCardOutline,
	mdiListBoxOutline,
	mdiTruckDeliveryOutline
} from '@mdi/js';

import { range } from 'd3-array';
import { Button, Paginate, Steps, Step } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const steps = [
			{ label: 'Register', completed: true },
			{ label: 'Choose plan', completed: true },
			{ label: 'Purchase', completed: false },
			{ label: 'Receive product', completed: false }
		];

		const stepsWithPoint = [
			{ label: 'Register', completed: true, point: '✓' },
			{ label: 'Choose plan', completed: true, point: '✓' },
			{ label: 'Purchase', completed: false, point: '' },
			{ label: 'Receive product', completed: false, point: '' }
		];

		const stepsWithIcon = [
			{ label: 'Register', completed: true, icon: mdiCheck },
			{
				label: 'Choose plan',
				completed: true,
				icon: mdiListBoxOutline
			},

			{
				label: 'Purchase',
				completed: false,
				icon: mdiCreditCardOutline
			},

			{
				label: 'Receive product',
				completed: false,
				icon: mdiTruckDeliveryOutline
			}
		];

		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, { data: steps });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Vertical</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, { data: steps, vertical: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom point content (step data)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, { data: stepsWithPoint });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom point (Step component)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, {
					children: ($$renderer) => {
						Step($$renderer, {
							point: '?',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 1`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '!',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 2`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '✓',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 3`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '✕',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 4`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '★',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 5`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 6`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '●',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 7`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 8`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 9`);
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

		$$renderer.push(`<!----> <h2>Custom icon (step data)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, { data: stepsWithIcon });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom icon (Step component)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, {
					children: ($$renderer) => {
						Step($$renderer, {
							icon: mdiCheck,
							completed: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Register`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							icon: mdiListBoxOutline,
							completed: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Choose plan`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							icon: mdiCreditCardOutline,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Purchase`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							icon: mdiTruckDeliveryOutline,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Receive product`);
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

		$$renderer.push(`<!----> <h2>Custom point content and completed colors</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, {
					children: ($$renderer) => {
						Step($$renderer, {
							point: '?',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 1`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '!',
							classes: { completed: 'bg-secondary text-secondary-content' },
							completed: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 2`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '✓',
							classes: { completed: 'bg-secondary text-secondary-content' },
							completed: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 3`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '✕',
							classes: { completed: 'bg-secondary text-secondary-content' },
							completed: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 4`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '★',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 5`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '',
							classes: { completed: 'bg-info text-info-content' },
							completed: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 6`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '●',
							classes: { completed: 'bg-success text-success-content' },
							completed: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 7`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							classes: { completed: 'bg-success text-success-content' },
							completed: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 8`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							classes: { completed: 'bg-danger text-danger-content' },
							completed: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Step 9`);
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

		$$renderer.push(`<!----> <h2>Custom colors (Step component)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, {
					children: ($$renderer) => {
						Step($$renderer, {
							completed: true,
							classes: { completed: 'bg-success text-success-content' },
							children: ($$renderer) => {
								$$renderer.push(`<!---->Fly to moon`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							completed: true,
							classes: { completed: 'bg-success text-success-content' },
							children: ($$renderer) => {
								$$renderer.push(`<!---->Shrink the moon`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							completed: true,
							classes: { completed: 'bg-success text-success-content' },
							children: ($$renderer) => {
								$$renderer.push(`<!---->Grab the moon`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							point: '?',
							classes: { point: 'bg-danger text-danger-content' },
							children: ($$renderer) => {
								$$renderer.push(`<!---->Sit on the toilet`);
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

		$$renderer.push(`<!----> <h2>Change line and point size</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, {
					data: stepsWithIcon,
					classes: { item: { point: 'size-6 text-xs', line: 'h-1' } }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Add line gap</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="inline-grid gap-2 justify-items-center">`);

				Steps($$renderer, {
					data: stepsWithIcon,
					classes: { item: { line: 'h-1 w-1/2 rounded' } }
				});

				$$renderer.push(`<!----> <div>or</div> `);

				Steps($$renderer, {
					data: stepsWithIcon,
					classes: {
						item: {
							label: 'z-[1]',
							point: 'outline outline-[20px] outline-surface-100',
							line: 'h-1'
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Remove point background</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, {
					data: stepsWithIcon,
					classes: {
						item: {
							point: 'bg-surface-100 size-12',
							line: 'h-0.5',
							completed: 'text-primary bg-primary'
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Remove point background (vertical)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, {
					data: stepsWithIcon,
					vertical: true,
					classes: {
						item: {
							point: 'bg-surface-100 size-10',
							line: 'w-0.5',
							completed: 'text-primary bg-primary'
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Gradient</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, {
					data: stepsWithIcon,
					classes: {
						item: {
							point: 'size-10',
							completed: 'bg-gradient-to-br from-primary to-secondary text-primary-content'
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Gradient (vertical)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Steps($$renderer, {
					data: stepsWithIcon,
					vertical: true,
					classes: {
						item: {
							point: 'size-10',
							completed: 'bg-gradient-to-br from-primary to-secondary text-primary-content'
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Pagination integration</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Paginate($$renderer, {
					data: range(4),
					perPage: 1,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { pagination, current }) => {
							$$renderer.push(`<div class="inline-grid gap-5">`);

							Steps($$renderer, {
								children: ($$renderer) => {
									Step($$renderer, {
										completed: current.page >= 1,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Register`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Step($$renderer, {
										completed: current.page >= 2,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Choose plan`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Step($$renderer, {
										completed: current.page >= 3,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Purchase`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Step($$renderer, {
										completed: current.page >= 4,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Receive product`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div>`);

							Button($$renderer, {
								disabled: current.isFirst,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Previous`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'primary',
								variant: 'fill',
								disabled: current.isLast,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Next`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}