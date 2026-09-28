import * as $ from 'svelte/internal/server';
import { Badge, Button, Icon, NumberStepper } from 'svelte-ux';
import { mdiFilterVariant, mdiPlus, mdiMinus } from '@mdi/js';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let value = 1;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> `);

		NumberStepper($$renderer, {
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <h2>Button</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Button w/ small</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					small: true,
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon Button</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, variant: 'outline', class: 'p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon Button w/ small</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					small: true,
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, variant: 'outline', class: 'p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Dot</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					dot: true,
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, variant: 'outline', class: 'p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Dot w/ small</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					dot: true,
					small: true,
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, variant: 'outline', class: 'p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Style</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					class: 'bg-success text-success-content',
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, variant: 'outline', class: 'p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Value slot</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, variant: 'outline', class: 'p-3' });
					},

					$$slots: {
						default: true,
						value: ($$renderer) => {
							$$renderer.push(`<div slot="value" class="bg-success text-success-content rounded-full">`);
							Icon($$renderer, { data: mdiPlus });
							$$renderer.push(`<!----></div>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Multiple</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					placement: 'bottom-right',
					value,
					dot: true,
					circle: true,
					class: 'bg-danger',
					children: ($$renderer) => {
						Badge($$renderer, {
							placement: 'top-right',
							value,
							dot: true,
							circle: true,
							class: 'bg-success',
							children: ($$renderer) => {
								Button($$renderer, { icon: mdiFilterVariant, variant: 'outline', class: 'p-3' });
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Placement</h2> <div class="grid grid-cols-5 gap-4"><div><h3 class="text-sm text-surface-content/50">Button w/ default</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Button w/ top-left</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					placement: 'top-left',
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Button w/ top-right</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					placement: 'top-right',
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Button w/ bottom-left</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					placement: 'bottom-left',
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Button w/ bottom-right</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					placement: 'bottom-right',
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Button w/ default</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					small: true,
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Button w/ top-left</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					small: true,
					placement: 'top-left',
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Button w/ top-right</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					small: true,
					placement: 'top-right',
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Button w/ bottom-left</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					small: true,
					placement: 'bottom-left',
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Button w/ bottom-right</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					small: true,
					placement: 'bottom-right',
					children: ($$renderer) => {
						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ default</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, class: 'border p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ top-left</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					placement: 'top-left',
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, class: 'border p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ top-right</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					placement: 'top-right',
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, class: 'border p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ bottom-left</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					placement: 'bottom-left',
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, class: 'border p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ bottom-right</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					placement: 'bottom-right',
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, class: 'border p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ default</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					small: true,
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, class: 'border p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ top-left</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					small: true,
					placement: 'top-left',
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, class: 'border p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ top-right</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					small: true,
					placement: 'top-right',
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, class: 'border p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ bottom-left</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					small: true,
					placement: 'bottom-left',
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, class: 'border p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><h3 class="text-sm text-surface-content/50">Icon Button w/ bottom-right</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Badge($$renderer, {
					value,
					circle: true,
					small: true,
					placement: 'bottom-right',
					children: ($$renderer) => {
						Button($$renderer, { icon: mdiFilterVariant, class: 'border p-3' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}