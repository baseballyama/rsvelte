import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import { mdiArrowRight } from '@mdi/js';
import { Button, Card, Collapse } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
          omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
          Inventore laborum rerum at id?</div>`);

var root_1 = $.from_html(`<!> <!> <div></div>`, 1);

var root_2 = $.from_html(`<div class="px-3 pb-3 border-t">Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
          omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
          Inventore laborum rerum at id?</div>`);

var root_3 = $.from_html(`<div slot="trigger" class="flex-1 px-3 py-3"></div>`);

var root_4 = $.from_html(`<div class="px-3 pb-3 bg-surface-200 border-t">Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis quod culpa et, dolores
        omnis, ipsum in perspiciatis porro ut nihil molestiae molestias tenetur delectus velit!
        Inventore laborum rerum at id?</div>`);

var root_5 = $.from_html(`<h1>Examples</h1> <h2>Separate (no bind:group)</h2> <!> <h2>Accordian (with bind:group)</h2> <!> <h2>Controlled</h2> <!> <h2>Expansion Panel</h2> <!> <h2>Expansion Panel</h2> <h3>with popout</h3> <!> <h2>Custom transition</h2> <!> <h2>Transition params</h2> <!> <h2>Custom icon and transition</h2> <!> <h2>Flip icon transition</h2> <!>`, 1);

export default function _page($$anchor) {
	const binding_group = [];
	let group = undefined;
	let controlledOpen = [false, true, false, false, false];
	var fragment = root_5();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 16, () => Array(5), $.index, ($$anchor, _, i) => {
						Collapse($$anchor, {
							name: `Item ${i + 1}`,
							children: ($$anchor, $$slotProps) => {
								var div = root();

								$.append($$anchor, div);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_3 = $.first_child(fragment_5);

					$.each(node_3, 16, () => Array(5), $.index, ($$anchor, _, i) => {
						Collapse($$anchor, {
							name: `Item ${i + 1}`,
							value: i,
							get group() {
								return group;
							},

							set group($$value) {
								group = $$value;
							},

							children: ($$anchor, $$slotProps) => {
								var div_1 = root();

								$.append($$anchor, div_1);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_1();
			var node_5 = $.first_child(fragment_7);

			Card(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = $.comment();
					var node_6 = $.first_child(fragment_8);

					$.each(node_6, 16, () => Array(5), $.index, ($$anchor, _, i) => {
						Collapse($$anchor, {
							name: `Item ${i + 1}`,
							get open() {
								return controlledOpen[i];
							},

							set open($$value) {
								controlledOpen[i] = $$value;
							},

							children: ($$anchor, $$slotProps) => {
								var div_2 = root();

								$.append($$anchor, div_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_5, 2);

			$.each(node_7, 16, () => Array(5), $.index, ($$anchor, _, i) => {
				Button($$anchor, {
					$$events: { click: () => controlledOpen[i] = !controlledOpen[i] },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						text.nodeValue = `Toggle ${i + 1}`;
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.next(2);
			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				class: 'divide-y',
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = $.comment();
					var node_9 = $.first_child(fragment_13);

					$.each(node_9, 16, () => Array(5), $.index, ($$anchor, _, i) => {
						Collapse($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var div_3 = root_2();

								$.append($$anchor, div_3);
							},

							$$slots: {
								default: true,
								trigger: ($$anchor, $$slotProps) => {
									var div_4 = root_3();

									div_4.textContent = `Item ${i + 1}`;
									$.append($$anchor, div_4);
								}
							}
						});
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_8, 6);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = $.comment();
			var node_11 = $.first_child(fragment_15);

			$.each(node_11, 16, () => Array(5), $.index, ($$anchor, _, i) => {
				Collapse($$anchor, {
					popout: true,
					class: 'bg-surface-100 elevation-1 border-t first:border-t-0 first:rounded-t last:rounded-b',
					children: ($$anchor, $$slotProps) => {
						var div_5 = root_4();

						$.append($$anchor, div_5);
					},

					$$slots: {
						default: true,
						trigger: ($$anchor, $$slotProps) => {
							var div_6 = root_3();

							div_6.textContent = `Item ${i + 1}`;
							$.append($$anchor, div_6);
						}
					}
				});
			});

			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_10, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_18 = $.comment();
					var node_13 = $.first_child(fragment_18);

					$.each(node_13, 16, () => Array(5), $.index, ($$anchor, _, i) => {
						Collapse($$anchor, {
							name: `Item ${i + 1}`,
							get transition() {
								return fade;
							},

							children: ($$anchor, $$slotProps) => {
								var div_7 = root();

								$.append($$anchor, div_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_12, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_21 = $.comment();
					var node_15 = $.first_child(fragment_21);

					$.each(node_15, 16, () => Array(5), $.index, ($$anchor, _, i) => {
						Collapse($$anchor, {
							name: `Item ${i + 1}`,
							transitionParams: { duration: 2000 },
							children: ($$anchor, $$slotProps) => {
								var div_8 = root();

								$.append($$anchor, div_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_21);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_14, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_24 = $.comment();
					var node_17 = $.first_child(fragment_24);

					$.each(node_17, 16, () => Array(5), $.index, ($$anchor, _, i) => {
						Collapse($$anchor, {
							name: `Item ${i + 1}`,
							get icon() {
								return mdiArrowRight;
							},
							classes: { icon: 'data-[open=true]:rotate-90' },
							children: ($$anchor, $$slotProps) => {
								var div_9 = root();

								$.append($$anchor, div_9);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_24);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_16, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_27 = $.comment();
					var node_19 = $.first_child(fragment_27);

					$.each(node_19, 16, () => Array(5), $.index, ($$anchor, _, i) => {
						Collapse($$anchor, {
							name: `Item ${i + 1}`,
							classes: {
								icon: 'data-[open=true]:rotate-0 data-[open=true]:-scale-y-100'
							},

							children: ($$anchor, $$slotProps) => {
								var div_10 = root();

								$.append($$anchor, div_10);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_27);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}