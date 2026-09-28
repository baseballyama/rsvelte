import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Popover, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="p-2 bg-surface-100 border shadow">Example contents</div>`);
var root_1 = $.from_html(`<div class="inline-block"><!> <!></div>`);
var root_2 = $.from_html(`<div class="px-4 py-8 bg-surface-100 border shadow">Contents</div>`);
var root_3 = $.from_html(`<div class="col-start-2 text-right"><div class="inline-block"><!> <!></div></div>`);
var root_4 = $.from_html(`<div class="col-start-3 text-center"><div class="inline-block"><!> <!></div></div>`);
var root_5 = $.from_html(`<div class="col-start-4 text-left"><div class="inline-block"><!> <!></div></div>`);
var root_6 = $.from_html(`<div class="col-start-1 text-right"><div class="inline-block"><!> <!></div></div>`);
var root_7 = $.from_html(`<div class="col-start-5 text-left"><div class="inline-block"><!> <!></div></div>`);
var root_8 = $.from_html(`<div class="mx-20"><div class="grid grid-cols-5"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div></div>`);
var root_9 = $.from_html(`<h1>Examples</h1> <h2>Inferred anchor</h2> <h3>Uses the parent element of \`Popover\` if \`anchorEl\` not provided</h3> <!> <h2>Placement</h2> <!>`, 1);

export default function _page($$anchor) {
	let open = false;
	var fragment = root_9();
	var node = $.sibling($.first_child(fragment), 6);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node_1 = $.child(div);

			Popover(node_1, {
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				$$events: { click: () => open = !open },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Click me');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_8();
			var div_3 = $.child(div_2);
			var node_4 = $.child(div_3);

			Toggle(node_4, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_4 = root_3();
						var div_5 = $.child(div_4);
						var node_5 = $.child(div_5);

						Popover(node_5, {
							get open() {
								return $.get(open);
							},
							placement: 'top-start',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_6 = root_2();

								$.append($$anchor, div_6);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						Button(node_6, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Top Start');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.reset(div_5);
						$.reset(div_4);
						$.append($$anchor, div_4);
					}
				}
			});

			var node_7 = $.sibling(node_4, 2);

			Toggle(node_7, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_7 = root_4();
						var div_8 = $.child(div_7);
						var node_8 = $.child(div_8);

						Popover(node_8, {
							get open() {
								return $.get(open);
							},
							placement: 'top',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_9 = root_2();

								$.append($$anchor, div_9);
							},
							$$slots: { default: true }
						});

						var node_9 = $.sibling(node_8, 2);

						Button(node_9, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Top');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						$.reset(div_8);
						$.reset(div_7);
						$.append($$anchor, div_7);
					}
				}
			});

			var node_10 = $.sibling(node_7, 2);

			Toggle(node_10, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_10 = root_5();
						var div_11 = $.child(div_10);
						var node_11 = $.child(div_11);

						Popover(node_11, {
							get open() {
								return $.get(open);
							},
							placement: 'top-end',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_12 = root_2();

								$.append($$anchor, div_12);
							},
							$$slots: { default: true }
						});

						var node_12 = $.sibling(node_11, 2);

						Button(node_12, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Top End');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						$.reset(div_11);
						$.reset(div_10);
						$.append($$anchor, div_10);
					}
				}
			});

			var node_13 = $.sibling(node_10, 2);

			Toggle(node_13, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_13 = root_6();
						var div_14 = $.child(div_13);
						var node_14 = $.child(div_14);

						Popover(node_14, {
							get open() {
								return $.get(open);
							},
							placement: 'left-start',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_15 = root_2();

								$.append($$anchor, div_15);
							},
							$$slots: { default: true }
						});

						var node_15 = $.sibling(node_14, 2);

						Button(node_15, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Left Start');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});

						$.reset(div_14);
						$.reset(div_13);
						$.append($$anchor, div_13);
					}
				}
			});

			var node_16 = $.sibling(node_13, 2);

			Toggle(node_16, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_16 = root_7();
						var div_17 = $.child(div_16);
						var node_17 = $.child(div_17);

						Popover(node_17, {
							get open() {
								return $.get(open);
							},
							placement: 'right-start',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_18 = root_2();

								$.append($$anchor, div_18);
							},
							$$slots: { default: true }
						});

						var node_18 = $.sibling(node_17, 2);

						Button(node_18, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Right Start');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						$.reset(div_17);
						$.reset(div_16);
						$.append($$anchor, div_16);
					}
				}
			});

			var node_19 = $.sibling(node_16, 2);

			Toggle(node_19, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_19 = root_6();
						var div_20 = $.child(div_19);
						var node_20 = $.child(div_20);

						Popover(node_20, {
							get open() {
								return $.get(open);
							},
							placement: 'left',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_21 = root_2();

								$.append($$anchor, div_21);
							},
							$$slots: { default: true }
						});

						var node_21 = $.sibling(node_20, 2);

						Button(node_21, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Left');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});

						$.reset(div_20);
						$.reset(div_19);
						$.append($$anchor, div_19);
					}
				}
			});

			var node_22 = $.sibling(node_19, 2);

			Toggle(node_22, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_22 = root_7();
						var div_23 = $.child(div_22);
						var node_23 = $.child(div_23);

						Popover(node_23, {
							get open() {
								return $.get(open);
							},
							placement: 'right',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_24 = root_2();

								$.append($$anchor, div_24);
							},
							$$slots: { default: true }
						});

						var node_24 = $.sibling(node_23, 2);

						Button(node_24, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Right');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});

						$.reset(div_23);
						$.reset(div_22);
						$.append($$anchor, div_22);
					}
				}
			});

			var node_25 = $.sibling(node_22, 2);

			Toggle(node_25, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_25 = root_6();
						var div_26 = $.child(div_25);
						var node_26 = $.child(div_26);

						Popover(node_26, {
							get open() {
								return $.get(open);
							},
							placement: 'left-end',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_27 = root_2();

								$.append($$anchor, div_27);
							},
							$$slots: { default: true }
						});

						var node_27 = $.sibling(node_26, 2);

						Button(node_27, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('Left End');

								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});

						$.reset(div_26);
						$.reset(div_25);
						$.append($$anchor, div_25);
					}
				}
			});

			var node_28 = $.sibling(node_25, 2);

			Toggle(node_28, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_28 = root_7();
						var div_29 = $.child(div_28);
						var node_29 = $.child(div_29);

						Popover(node_29, {
							get open() {
								return $.get(open);
							},
							placement: 'right-end',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_30 = root_2();

								$.append($$anchor, div_30);
							},
							$$slots: { default: true }
						});

						var node_30 = $.sibling(node_29, 2);

						Button(node_30, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_9 = $.text('Right End');

								$.append($$anchor, text_9);
							},
							$$slots: { default: true }
						});

						$.reset(div_29);
						$.reset(div_28);
						$.append($$anchor, div_28);
					}
				}
			});

			var node_31 = $.sibling(node_28, 2);

			Toggle(node_31, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_31 = root_3();
						var div_32 = $.child(div_31);
						var node_32 = $.child(div_32);

						Popover(node_32, {
							get open() {
								return $.get(open);
							},
							placement: 'bottom-start',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_33 = root_2();

								$.append($$anchor, div_33);
							},
							$$slots: { default: true }
						});

						var node_33 = $.sibling(node_32, 2);

						Button(node_33, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_10 = $.text('Bottom Start');

								$.append($$anchor, text_10);
							},
							$$slots: { default: true }
						});

						$.reset(div_32);
						$.reset(div_31);
						$.append($$anchor, div_31);
					}
				}
			});

			var node_34 = $.sibling(node_31, 2);

			Toggle(node_34, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_34 = root_4();
						var div_35 = $.child(div_34);
						var node_35 = $.child(div_35);

						Popover(node_35, {
							get open() {
								return $.get(open);
							},
							placement: 'bottom',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_36 = root_2();

								$.append($$anchor, div_36);
							},
							$$slots: { default: true }
						});

						var node_36 = $.sibling(node_35, 2);

						Button(node_36, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_11 = $.text('Bottom');

								$.append($$anchor, text_11);
							},
							$$slots: { default: true }
						});

						$.reset(div_35);
						$.reset(div_34);
						$.append($$anchor, div_34);
					}
				}
			});

			var node_37 = $.sibling(node_34, 2);

			Toggle(node_37, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var div_37 = root_5();
						var div_38 = $.child(div_37);
						var node_38 = $.child(div_38);

						Popover(node_38, {
							get open() {
								return $.get(open);
							},
							placement: 'bottom-start',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_39 = root_2();

								$.append($$anchor, div_39);
							},
							$$slots: { default: true }
						});

						var node_39 = $.sibling(node_38, 2);

						Button(node_39, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_12 = $.text('Bottom End');

								$.append($$anchor, text_12);
							},
							$$slots: { default: true }
						});

						$.reset(div_38);
						$.reset(div_37);
						$.append($$anchor, div_37);
					}
				}
			});

			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}