import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	mdiCheck,
	mdiCreditCardOutline,
	mdiListBoxOutline,
	mdiTruckDeliveryOutline
} from '@mdi/js';

import { range } from 'd3-array';
import { Button, Paginate, Steps, Step } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="inline-grid gap-2 justify-items-center"><!> <div>or</div> <!></div>`);
var root_3 = $.from_html(`<div class="inline-grid gap-5"><!> <div><!> <!></div></div>`);
var root_4 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Vertical</h2> <!> <h2>Custom point content (step data)</h2> <!> <h2>Custom point (Step component)</h2> <!> <h2>Custom icon (step data)</h2> <!> <h2>Custom icon (Step component)</h2> <!> <h2>Custom point content and completed colors</h2> <!> <h2>Custom colors (Step component)</h2> <!> <h2>Change line and point size</h2> <!> <h2>Add line gap</h2> <!> <h2>Remove point background</h2> <!> <h2>Remove point background (vertical)</h2> <!> <h2>Gradient</h2> <!> <h2>Gradient (vertical)</h2> <!> <h2>Pagination integration</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_4();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				get data() {
					return steps;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				get data() {
					return steps;
				},
				vertical: true
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				get data() {
					return stepsWithPoint;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_4 = $.first_child(fragment_5);

					Step(node_4, {
						point: '?',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Step 1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Step(node_5, {
						point: '!',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Step 2');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Step(node_6, {
						point: '✓',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Step 3');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Step(node_7, {
						point: '✕',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Step 4');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Step(node_8, {
						point: '★',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Step 5');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Step(node_9, {
						point: '',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Step 6');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Step(node_10, {
						point: '●',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Step 7');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Step(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Step 8');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Step(node_12, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Step 9');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_3, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				get data() {
					return stepsWithIcon;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_1();
					var node_15 = $.first_child(fragment_8);

					Step(node_15, {
						get icon() {
							return mdiCheck;
						},
						completed: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Register');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Step(node_16, {
						get icon() {
							return mdiListBoxOutline;
						},
						completed: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Choose plan');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Step(node_17, {
						get icon() {
							return mdiCreditCardOutline;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Purchase');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					Step(node_18, {
						get icon() {
							return mdiTruckDeliveryOutline;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('Receive product');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_14, 4);

	Preview(node_19, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var node_20 = $.first_child(fragment_10);

					Step(node_20, {
						point: '?',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Step 1');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_21 = $.sibling(node_20, 2);

					Step(node_21, {
						point: '!',
						classes: { completed: 'bg-secondary text-secondary-content' },
						completed: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('Step 2');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});

					var node_22 = $.sibling(node_21, 2);

					Step(node_22, {
						point: '✓',
						classes: { completed: 'bg-secondary text-secondary-content' },
						completed: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('Step 3');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					var node_23 = $.sibling(node_22, 2);

					Step(node_23, {
						point: '✕',
						classes: { completed: 'bg-secondary text-secondary-content' },
						completed: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('Step 4');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					var node_24 = $.sibling(node_23, 2);

					Step(node_24, {
						point: '★',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('Step 5');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_24, 2);

					Step(node_25, {
						point: '',
						classes: { completed: 'bg-info text-info-content' },
						completed: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('Step 6');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});

					var node_26 = $.sibling(node_25, 2);

					Step(node_26, {
						point: '●',
						classes: { completed: 'bg-success text-success-content' },
						completed: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_19 = $.text('Step 7');

							$.append($$anchor, text_19);
						},
						$$slots: { default: true }
					});

					var node_27 = $.sibling(node_26, 2);

					Step(node_27, {
						classes: { completed: 'bg-success text-success-content' },
						completed: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_20 = $.text('Step 8');

							$.append($$anchor, text_20);
						},
						$$slots: { default: true }
					});

					var node_28 = $.sibling(node_27, 2);

					Step(node_28, {
						classes: { completed: 'bg-danger text-danger-content' },
						completed: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_21 = $.text('Step 9');

							$.append($$anchor, text_21);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_29 = $.sibling(node_19, 4);

	Preview(node_29, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = root_1();
					var node_30 = $.first_child(fragment_12);

					Step(node_30, {
						completed: true,
						classes: { completed: 'bg-success text-success-content' },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_22 = $.text('Fly to moon');

							$.append($$anchor, text_22);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_30, 2);

					Step(node_31, {
						completed: true,
						classes: { completed: 'bg-success text-success-content' },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_23 = $.text('Shrink the moon');

							$.append($$anchor, text_23);
						},
						$$slots: { default: true }
					});

					var node_32 = $.sibling(node_31, 2);

					Step(node_32, {
						completed: true,
						classes: { completed: 'bg-success text-success-content' },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_24 = $.text('Grab the moon');

							$.append($$anchor, text_24);
						},
						$$slots: { default: true }
					});

					var node_33 = $.sibling(node_32, 2);

					Step(node_33, {
						point: '?',
						classes: { point: 'bg-danger text-danger-content' },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_25 = $.text('Sit on the toilet');

							$.append($$anchor, text_25);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_34 = $.sibling(node_29, 4);

	Preview(node_34, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				get data() {
					return stepsWithIcon;
				},
				classes: { item: { point: 'size-6 text-xs', line: 'h-1' } }
			});
		},
		$$slots: { default: true }
	});

	var node_35 = $.sibling(node_34, 4);

	Preview(node_35, {
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node_36 = $.child(div);

			Steps(node_36, {
				get data() {
					return stepsWithIcon;
				},
				classes: { item: { line: 'h-1 w-1/2 rounded' } }
			});

			var node_37 = $.sibling(node_36, 4);

			Steps(node_37, {
				get data() {
					return stepsWithIcon;
				},

				classes: {
					item: {
						label: 'z-[1]',
						point: 'outline outline-[20px] outline-surface-100',
						line: 'h-1'
					}
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_38 = $.sibling(node_35, 4);

	Preview(node_38, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				get data() {
					return stepsWithIcon;
				},

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

	var node_39 = $.sibling(node_38, 4);

	Preview(node_39, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				get data() {
					return stepsWithIcon;
				},
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

	var node_40 = $.sibling(node_39, 4);

	Preview(node_40, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				get data() {
					return stepsWithIcon;
				},

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

	var node_41 = $.sibling(node_40, 4);

	Preview(node_41, {
		children: ($$anchor, $$slotProps) => {
			Steps($$anchor, {
				get data() {
					return stepsWithIcon;
				},
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

	var node_42 = $.sibling(node_41, 4);

	Preview(node_42, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => range(4));

				Paginate($$anchor, {
					get data() {
						return $.get($0);
					},
					perPage: 1,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							const pagination = $.derived(() => $$slotProps.pagination);
							const current = $.derived(() => $$slotProps.current);
							var div_1 = root_3();
							var node_43 = $.child(div_1);

							Steps(node_43, {
								children: ($$anchor, $$slotProps) => {
									var fragment_19 = root_1();
									var node_44 = $.first_child(fragment_19);

									{
										let $0 = $.derived(() => $.get(current).page >= 1);

										Step(node_44, {
											get completed() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_26 = $.text('Register');

												$.append($$anchor, text_26);
											},
											$$slots: { default: true }
										});
									}

									var node_45 = $.sibling(node_44, 2);

									{
										let $0 = $.derived(() => $.get(current).page >= 2);

										Step(node_45, {
											get completed() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_27 = $.text('Choose plan');

												$.append($$anchor, text_27);
											},
											$$slots: { default: true }
										});
									}

									var node_46 = $.sibling(node_45, 2);

									{
										let $0 = $.derived(() => $.get(current).page >= 3);

										Step(node_46, {
											get completed() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_28 = $.text('Purchase');

												$.append($$anchor, text_28);
											},
											$$slots: { default: true }
										});
									}

									var node_47 = $.sibling(node_46, 2);

									{
										let $0 = $.derived(() => $.get(current).page >= 4);

										Step(node_47, {
											get completed() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_29 = $.text('Receive product');

												$.append($$anchor, text_29);
											},
											$$slots: { default: true }
										});
									}

									$.append($$anchor, fragment_19);
								},
								$$slots: { default: true }
							});

							var div_2 = $.sibling(node_43, 2);
							var node_48 = $.child(div_2);

							Button(node_48, {
								get disabled() {
									return $.get(current).isFirst;
								},

								$$events: {
									click: function (...$$args) {
										$.get(pagination).prevPage?.apply(this, $$args);
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_30 = $.text('Previous');

									$.append($$anchor, text_30);
								},
								$$slots: { default: true }
							});

							var node_49 = $.sibling(node_48, 2);

							Button(node_49, {
								color: 'primary',
								variant: 'fill',
								get disabled() {
									return $.get(current).isLast;
								},

								$$events: {
									click: function (...$$args) {
										$.get(pagination).nextPage?.apply(this, $$args);
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_31 = $.text('Next');

									$.append($$anchor, text_31);
								},
								$$slots: { default: true }
							});

							$.reset(div_2);
							$.reset(div_1);
							$.append($$anchor, div_1);
						}
					}
				});
			}
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}