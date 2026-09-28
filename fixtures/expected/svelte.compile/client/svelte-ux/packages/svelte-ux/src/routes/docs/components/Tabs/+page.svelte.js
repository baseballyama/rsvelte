import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { max } from 'd3-array';
import { mdiClose, mdiPlus } from '@mdi/js';
import { Icon, Tab, Tabs } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="grid grid-cols-2 gap-4"><!> <!> <!> <!></div>`);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<h1>Examples</h1> <h2>options</h2> <!> <h2>Tab components</h2> <!> <h2>placement</h2> <!> <h2>rounded and contained</h2> <!> <h2>add / remove</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let options = [
		{ label: 'One', value: 1 },
		{ label: 'Two', value: 2 },
		{ label: 'Three', value: 3 },
		{ label: 'Four', value: 4 }
	];

	let value = 1;
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Tabs($$anchor, {
				get options() {
					return options;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					content: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var text = $.text();

						$.template_effect(() => $.set_text(text, `Page ${$.get(value) ?? ''}`));
						$.append($$anchor, text);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Tabs($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_2 = $.first_child(fragment_4);

					$.each(node_2, 16, () => ({ length: 5 }), $.index, ($$anchor, _, i) => {
						const v = $.derived(() => i + 1);

						{
							let $0 = $.derived(() => value === $.get(v));

							Tab($$anchor, {
								get selected() {
									return $.get($0);
								},
								$$events: { click: () => value = $.get(v) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, `Tab ${$.get(v) ?? ''}`));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_4);
				},

				$$slots: {
					default: true,
					content: ($$anchor, $$slotProps) => {
						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, `Page ${value ?? ''}`));
						$.append($$anchor, text_2);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_4 = $.child(div);

			Tabs(node_4, {
				get options() {
					return options;
				},
				placement: 'top',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					content: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, `Page ${$.get(value) ?? ''}`));
						$.append($$anchor, text_3);
					}
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Tabs(node_5, {
				get options() {
					return options;
				},
				placement: 'bottom',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					content: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, `Page ${$.get(value) ?? ''}`));
						$.append($$anchor, text_4);
					}
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Tabs(node_6, {
				get options() {
					return options;
				},
				placement: 'left',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					content: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, `Page ${$.get(value) ?? ''}`));
						$.append($$anchor, text_5);
					}
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Tabs(node_7, {
				get options() {
					return options;
				},
				placement: 'right',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					content: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, `Page ${$.get(value) ?? ''}`));
						$.append($$anchor, text_6);
					}
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_3, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_9 = $.child(div_1);

			Tabs(node_9, {
				get options() {
					return options;
				},
				placement: 'top',
				classes: {
					content: 'border px-4 py-2 rounded-b rounded-tr',
					tab: { root: 'rounded-t' }
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					content: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, `Page ${$.get(value) ?? ''}`));
						$.append($$anchor, text_7);
					}
				}
			});

			var node_10 = $.sibling(node_9, 2);

			Tabs(node_10, {
				get options() {
					return options;
				},
				placement: 'bottom',
				classes: {
					content: 'border px-4 py-2  rounded-t rounded-br',
					tab: { root: 'rounded-b' }
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					content: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, `Page ${$.get(value) ?? ''}`));
						$.append($$anchor, text_8);
					}
				}
			});

			var node_11 = $.sibling(node_10, 2);

			Tabs(node_11, {
				get options() {
					return options;
				},
				placement: 'left',
				classes: {
					content: 'border px-4 py-2  rounded-r',
					tab: { root: 'rounded-l' }
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					content: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, `Page ${$.get(value) ?? ''}`));
						$.append($$anchor, text_9);
					}
				}
			});

			var node_12 = $.sibling(node_11, 2);

			Tabs(node_12, {
				get options() {
					return options;
				},
				placement: 'right',
				classes: {
					content: 'border px-4 py-2 rounded-l',
					tab: { root: 'rounded-r' }
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$slots: {
					content: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, `Page ${$.get(value) ?? ''}`));
						$.append($$anchor, text_10);
					}
				}
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_8, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			Tabs($$anchor, {
				get options() {
					return options;
				},

				get value() {
					return value;
				},
				$$events: { change: (e) => value = e.detail.value },
				children: ($$anchor, $$slotProps) => {
					var fragment_17 = root_2();
					var node_14 = $.first_child(fragment_17);

					$.each(node_14, 17, () => options, (option) => option.value, ($$anchor, option) => {
						{
							let $0 = $.derived(() => value === $.get(option).value);

							Tab($$anchor, {
								get selected() {
									return $.get($0);
								},
								$$events: { click: () => value = $.get(option).value },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_19 = root_1();
									var text_11 = $.first_child(fragment_19);
									var node_15 = $.sibling(text_11);

									Icon(node_15, {
										get data() {
											return mdiClose;
										},
										class: 'rounded-full p-0.5 hover:bg-surface-content/5',
										$$events: {
											click: (e) => {
												e.stopPropagation();
												options = options.filter((o) => o.value !== $.get(option).value);
											}
										}
									});

									$.template_effect(() => $.set_text(text_11, `${$.get(option).label ?? ''} `));
									$.append($$anchor, fragment_19);
								},
								$$slots: { default: true }
							});
						}
					});

					var node_16 = $.sibling(node_14, 2);

					Tab(node_16, {
						$$events: {
							click: () => {
								const newValue = max(options, (d) => d.value) ?? 0 + 1;

								options = [...options, { label: 'New ' + newValue, value: newValue }];
							}
						},

						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, {
								get data() {
									return mdiPlus;
								},
								class: 'rounded-full p-0.5 hover:bg-surface-content/5'
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_17);
				},

				$$slots: {
					default: true,
					content: ($$anchor, $$slotProps) => {
						var text_12 = $.text();

						$.template_effect(() => $.set_text(text_12, `Page ${value ?? ''}`));
						$.append($$anchor, text_12);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}