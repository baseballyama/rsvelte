import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { z } from 'zod';
import { Button, Form, TextField } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <div class="mt-2"><div> </div> <div> </div></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <div class="mt-2"><div> </div></div>`, 1);
var root_2 = $.from_html(`<div class="grid gap-2"><!> <!></div> <!> <!> <div class="mt-2"><div> </div> <div> </div></div>`, 1);
var root_3 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Form submit button</h2> <!> <h2>Form submit with method</h2> <!> <h2>zod schema</h2> <!> <h2>zod schema with server submit</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let data = { name: 'Sean Lynch' };

	const schema = z.object({
		firstName: z.string().nonempty('First name is required').max(10),
		lastName: z.string().nonempty('Last name is required').max(10)
	});

	let schemaData = { firstName: '', lastName: '' };
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				get initial() {
					return data;
				},
				$$events: { change: (e) => data = e.detail },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const draft = $.derived(() => $$slotProps.draft);
						const state = $.derived(() => $$slotProps.state);
						const commit = $.derived(() => $$slotProps.commit);
						const revert = $.derived(() => $$slotProps.revert);
						const revertAll = $.derived(() => $$slotProps.revertAll);
						const undo = $.derived(() => $$slotProps.undo);
						const current = $.derived(() => $$slotProps.current);
						const refresh = $.derived(() => $$slotProps.refresh);
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						TextField(node_1, {
							label: 'Name',
							get value() {
								return $.get(draft).name;
							},

							$$events: {
								change: (e) => {
									$.get(draft).name = e.detail.value;

									// Call "refresh" as often as you want "current" updated (on:blur, etc)
									$.get(refresh)();
								}
							}
						});

						var node_2 = $.sibling(node_1, 2);

						{
							let $0 = $.derived(() => $.get(current).name == null);

							Button(node_2, {
								get disabled() {
									return $.get($0);
								},
								$$events: { click: () => $.get(commit)() },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Apply');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						}

						var node_3 = $.sibling(node_2, 2);

						Button(node_3, {
							$$events: { click: () => $.get(revert)() },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Cancel');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						Button(node_4, {
							$$events: { click: () => $.get(undo)() },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Undo');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						Button(node_5, {
							$$events: { click: () => $.get(revertAll)() },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Reset');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						var div = $.sibling(node_5, 2);
						var div_1 = $.child(div);
						var text_4 = $.only_child(div_1);
						var div_2 = $.sibling(div_1, 2);
						var text_5 = $.only_child(div_2);

						$.reset(div);

						$.template_effect(
							($0, $1) => {
								$.set_text(text_4, `current: ${$0 ?? ''}`);
								$.set_text(text_5, `state: ${$1 ?? ''}`);
							},
							[
								() => JSON.stringify($.get(current)),
								() => JSON.stringify($.get(state))
							]
						);

						$.append($$anchor, fragment_2);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				get initial() {
					return data;
				},
				$$events: { change: (e) => data = e.detail },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const draft = $.derived(() => $$slotProps.draft);
						const state = $.derived(() => $$slotProps.state);
						var fragment_4 = root_1();
						var node_7 = $.first_child(fragment_4);

						TextField(node_7, {
							label: 'Name',
							get value() {
								return $.get(draft).name;
							},

							$$events: {
								change: (e) => {
									$.get(draft).name = e.detail.value;
								}
							}
						});

						var node_8 = $.sibling(node_7, 2);

						Button(node_8, {
							type: 'submit',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Apply');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});

						var node_9 = $.sibling(node_8, 2);

						Button(node_9, {
							type: 'reset',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Cancel');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});

						var div_3 = $.sibling(node_9, 2);
						var div_4 = $.child(div_3);
						var text_8 = $.only_child(div_4);

						$.reset(div_3);
						$.template_effect(($0) => $.set_text(text_8, `state: ${$0 ?? ''}`), [() => JSON.stringify($.get(state))]);
						$.append($$anchor, fragment_4);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_6, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				method: 'post',
				get initial() {
					return data;
				},
				$$events: { change: (e) => data = e.detail },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const draft = $.derived(() => $$slotProps.draft);
						const state = $.derived(() => $$slotProps.state);
						var fragment_6 = root_1();
						var node_11 = $.first_child(fragment_6);

						TextField(node_11, {
							label: 'Name',
							get value() {
								return $.get(draft).name;
							},

							$$events: {
								change: (e) => {
									$.get(draft).name = e.detail.value;
								}
							}
						});

						var node_12 = $.sibling(node_11, 2);

						Button(node_12, {
							type: 'submit',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_9 = $.text('Apply');

								$.append($$anchor, text_9);
							},
							$$slots: { default: true }
						});

						var node_13 = $.sibling(node_12, 2);

						Button(node_13, {
							type: 'reset',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_10 = $.text('Cancel');

								$.append($$anchor, text_10);
							},
							$$slots: { default: true }
						});

						var div_5 = $.sibling(node_13, 2);
						var div_6 = $.child(div_5);
						var text_11 = $.only_child(div_6);

						$.reset(div_5);
						$.template_effect(($0) => $.set_text(text_11, `state: ${$0 ?? ''}`), [() => JSON.stringify($.get(state))]);
						$.append($$anchor, fragment_6);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_10, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				get initial() {
					return schemaData;
				},

				get schema() {
					return schema;
				},
				$$events: { change: (e) => schemaData = e.detail },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const draft = $.derived(() => $$slotProps.draft);
						const state = $.derived(() => $$slotProps.state);
						const errors = $.derived(() => $$slotProps.errors);
						var fragment_8 = root_2();
						var div_7 = $.first_child(fragment_8);
						var node_15 = $.child(div_7);

						TextField(node_15, {
							label: 'First Name',
							get value() {
								return $.get(draft).firstName;
							},

							get error() {
								return $.get(errors).firstName;
							},

							$$events: {
								change: (e) => {
									$.get(draft).firstName = e.detail.value;
								}
							}
						});

						var node_16 = $.sibling(node_15, 2);

						TextField(node_16, {
							label: 'Last Name',
							get value() {
								return $.get(draft).lastName;
							},

							get error() {
								return $.get(errors).lastName;
							},

							$$events: {
								change: (e) => {
									$.get(draft).lastName = e.detail.value;
								}
							}
						});

						$.reset(div_7);

						var node_17 = $.sibling(div_7, 2);

						Button(node_17, {
							type: 'submit',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_12 = $.text('Apply');

								$.append($$anchor, text_12);
							},
							$$slots: { default: true }
						});

						var node_18 = $.sibling(node_17, 2);

						Button(node_18, {
							type: 'reset',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_13 = $.text('Cancel');

								$.append($$anchor, text_13);
							},
							$$slots: { default: true }
						});

						var div_8 = $.sibling(node_18, 2);
						var div_9 = $.child(div_8);
						var text_14 = $.only_child(div_9);
						var div_10 = $.sibling(div_9, 2);
						var text_15 = $.only_child(div_10);

						$.reset(div_8);

						$.template_effect(
							($0, $1) => {
								$.set_text(text_14, `state: ${$0 ?? ''}`);
								$.set_text(text_15, `errors: ${$1 ?? ''}`);
							},
							[
								() => JSON.stringify($.get(state)),
								() => JSON.stringify($.get(errors))
							]
						);

						$.append($$anchor, fragment_8);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_14, 4);

	Preview(node_19, {
		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				method: 'post',
				get initial() {
					return schemaData;
				},

				get schema() {
					return schema;
				},
				$$events: { change: (e) => schemaData = e.detail },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const draft = $.derived(() => $$slotProps.draft);
						const state = $.derived(() => $$slotProps.state);
						const errors = $.derived(() => $$slotProps.errors);
						var fragment_10 = root_2();
						var div_11 = $.first_child(fragment_10);
						var node_20 = $.child(div_11);

						TextField(node_20, {
							label: 'First Name',
							get value() {
								return $.get(draft).firstName;
							},

							get error() {
								return $.get(errors).firstName;
							},

							$$events: {
								change: (e) => {
									$.get(draft).firstName = e.detail.value;
								}
							}
						});

						var node_21 = $.sibling(node_20, 2);

						TextField(node_21, {
							label: 'Last Name',
							get value() {
								return $.get(draft).lastName;
							},

							get error() {
								return $.get(errors).lastName;
							},

							$$events: {
								change: (e) => {
									$.get(draft).lastName = e.detail.value;
								}
							}
						});

						$.reset(div_11);

						var node_22 = $.sibling(div_11, 2);

						Button(node_22, {
							type: 'submit',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_16 = $.text('Apply');

								$.append($$anchor, text_16);
							},
							$$slots: { default: true }
						});

						var node_23 = $.sibling(node_22, 2);

						Button(node_23, {
							type: 'reset',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_17 = $.text('Cancel');

								$.append($$anchor, text_17);
							},
							$$slots: { default: true }
						});

						var div_12 = $.sibling(node_23, 2);
						var div_13 = $.child(div_12);
						var text_18 = $.only_child(div_13);
						var div_14 = $.sibling(div_13, 2);
						var text_19 = $.only_child(div_14);

						$.reset(div_12);

						$.template_effect(
							($0, $1) => {
								$.set_text(text_18, `state: ${$0 ?? ''}`);
								$.set_text(text_19, `errors: ${$1 ?? ''}`);
							},
							[
								() => JSON.stringify($.get(state)),
								() => JSON.stringify($.get(errors))
							]
						);

						$.append($$anchor, fragment_10);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}