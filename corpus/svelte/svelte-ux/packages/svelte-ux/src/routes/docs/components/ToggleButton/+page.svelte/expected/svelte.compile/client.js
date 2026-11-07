import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from 'svelte/transition';
import { mdiChevronDown } from '@mdi/js';

import {
	Button,
	ButtonGroup,
	Dialog,
	Drawer,
	Menu,
	MenuItem,
	ToggleButton
} from 'svelte-ux';

import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div slot="title">Are you sure you want to do that?</div>`);
var root_1 = $.from_html(`<div slot="actions"><!></div>`);
var root_2 = $.from_html(`<h1>Contents</h1> <div class="fixed bottom-0 w-full flex justify-center bg-surface-content/5 border-t p-1"><!></div>`, 1);
var root_3 = $.from_html(`<div></div>`);
var root_4 = $.from_html(`<div slot="toggle" class="mt-2 border-t"></div>`);
var root_5 = $.from_html(`<div slot="toggle" class="mt-2 border-b"></div>`);
var root_6 = $.from_html(`<div slot="toggle" class="mt-2 border-t border-b"></div>`);
var root_7 = $.from_html(`<!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!>`, 1);
var root_9 = $.from_html(`<h1>Examples</h1> <h2>Dialog</h2> <!> <h2>Drawer</h2> <!> <h2>slide transition</h2> <!> <h2>slide transition (button after)</h2> <!> <h2>on by default</h2> <!> <h2>ButtonGroup</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_9();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			ToggleButton($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);

						$.next();

						var text = $.text('Open Dialog');

						$.append($$anchor, text);
					},

					toggle: ($$anchor, $$slotProps) => {
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);

						Dialog($$anchor, {
							slot: 'toggle',
							open,
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},
							$$slots: {
								title: ($$anchor, $$slotProps) => {
									var div = root();

									$.append($$anchor, div);
								},

								actions: ($$anchor, $$slotProps) => {
									var div_1 = root_1();
									var node_1 = $.child(div_1);

									Button(node_1, {
										variant: 'fill',
										color: 'primary',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Close');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.reset(div_1);
									$.append($$anchor, div_1);
								}
							}
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			ToggleButton($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Open Drawer');

					$.append($$anchor, text_2);
				},

				$$slots: {
					default: true,
					toggle: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);

						Drawer($$anchor, {
							slot: 'toggle',
							get open() {
								return $.get(open);
							},
							class: 'w-[400px]',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var div_2 = $.sibling($.first_child(fragment_5), 2);
									var node_3 = $.child(div_2);

									Button(node_3, {
										$$events: {
											click: function (...$$args) {
												$.get(toggleOff)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Close');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.reset(div_2);
									$.append($$anchor, fragment_5);
								}
							}
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			ToggleButton($$anchor, {
				size: 'sm',
				get transition() {
					return slide;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const showDetails = $.derived(() => $$slotProps.on);

						$.next();

						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, `${$.get(showDetails) ? 'show less' : 'show more'}...`));
						$.append($$anchor, text_4);
					},

					toggle: ($$anchor, $$slotProps) => {
						var div_3 = root_4();

						$.each(div_3, 20, () => ({ length: 10 }), $.index, ($$anchor, _, i) => {
							var div_4 = root_3();

							div_4.textContent = i;
							$.append($$anchor, div_4);
						});

						$.reset(div_3);
						$.append($$anchor, div_3);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			ToggleButton($$anchor, {
				size: 'sm',
				get transition() {
					return slide;
				},
				buttonPlacement: 'after',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const showDetails = $.derived(() => $$slotProps.on);

						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, `${$.get(showDetails) ? 'show less' : 'show more'}...`));
						$.append($$anchor, text_5);
					},

					toggle: ($$anchor, $$slotProps) => {
						var div_5 = root_5();

						$.each(div_5, 20, () => ({ length: 10 }), $.index, ($$anchor, _, i) => {
							var div_6 = root_3();

							div_6.textContent = i;
							$.append($$anchor, div_6);
						});

						$.reset(div_5);
						$.append($$anchor, div_5);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			ToggleButton($$anchor, {
				on: true,
				size: 'sm',
				get transition() {
					return slide;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const showDetails = $.derived(() => $$slotProps.on);

						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, `${$.get(showDetails) ? 'show less' : 'show more'}...`));
						$.append($$anchor, text_6);
					},

					toggle: ($$anchor, $$slotProps) => {
						var div_7 = root_6();

						$.each(div_7, 20, () => ({ length: 10 }), $.index, ($$anchor, _, i) => {
							var div_8 = root_3();

							div_8.textContent = i;
							$.append($$anchor, div_8);
						});

						$.reset(div_7);
						$.append($$anchor, div_7);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root_8();
					var node_8 = $.first_child(fragment_13);

					Button(node_8, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Click me');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					ToggleButton(node_9, {
						get icon() {
							return mdiChevronDown;
						},
						iconOnly: true,
						rounded: true,
						class: 'px-1',
						transition: false,
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const open = $.derived(() => $$slotProps.on);
								const toggleOff = $.derived(() => $$slotProps.toggleOff);

								Menu($$anchor, {
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
										var fragment_15 = root_7();
										var node_10 = $.first_child(fragment_15);

										MenuItem(node_10, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('One');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});

										var node_11 = $.sibling(node_10, 2);

										MenuItem(node_11, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Two');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});

										var node_12 = $.sibling(node_11, 2);

										MenuItem(node_12, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Three');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_15);
									},
									$$slots: { default: true }
								});
							}
						}
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}