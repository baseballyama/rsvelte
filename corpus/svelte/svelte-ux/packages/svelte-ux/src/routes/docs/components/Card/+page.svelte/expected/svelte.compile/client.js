import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiDotsVertical } from '@mdi/js';
import { Avatar, Button, Card, Header, Settings } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div slot="avatar"><!></div>`);
var root_1 = $.from_html(`<div slot="actions"><!></div>`);
var root_2 = $.from_html(`<div slot="contents">Contents</div>`);
var root_3 = $.from_html(`<div slot="actions"><!> <!></div>`);
var root_4 = $.from_html(`<div slot="contents" class="bg-danger/10">Contents</div>`);
var root_5 = $.from_html(`<div slot="contents" class="bg-danger/10 h-40">Contents</div>`);
var root_6 = $.from_html(`<div class="grid grid-cols-3 gap-3"><!> <!> <!></div>`);
var root_7 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Title</h2> <!> <h2>Title with subheading</h2> <!> <h2>Title as array</h2> <!> <h2>Title with subheading as array</h2> <!> <h2>Header with Avatar</h2> <!> <h2>Header with Actions</h2> <!> <h2>Header with Avatar & Actions</h2> <!> <h2>Contents slot</h2> <!> <h2>Actions slot</h2> <!> <h2>Actions slot alignment (always bottom)</h2> <!> <h2>Loading</h2> <!> <h2>remove shadow</h2> <!> <h2>Settings</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_7();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Contents');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, { title: 'Title' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, { title: 'Title', subheading: 'Subheading' });
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, { title: ['One', 'Two', 'Three'] });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, { title: 'Title', subheading: ['One', 'Two', 'Three'] });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				$$slots: {
					header: ($$anchor, $$slotProps) => {
						Header($$anchor, {
							title: 'Title',
							subheading: 'Subheading',
							slot: 'header',
							$$slots: {
								avatar: ($$anchor, $$slotProps) => {
									var div = root();
									var node_6 = $.child(div);

									Avatar(node_6, {
										class: 'bg-primary text-primary-content font-bold',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('A');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.reset(div);
									$.append($$anchor, div);
								}
							}
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_5, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				$$slots: {
					header: ($$anchor, $$slotProps) => {
						Header($$anchor, {
							title: 'Title',
							subheading: 'Subheading',
							slot: 'header',
							$$slots: {
								actions: ($$anchor, $$slotProps) => {
									var div_1 = root_1();
									var node_8 = $.child(div_1);

									Button(node_8, {
										get icon() {
											return mdiDotsVertical;
										},
										class: 'w-12 h-12'
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

	var node_9 = $.sibling(node_7, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				$$slots: {
					header: ($$anchor, $$slotProps) => {
						Header($$anchor, {
							title: 'Title',
							subheading: 'Subheading',
							slot: 'header',
							$$slots: {
								avatar: ($$anchor, $$slotProps) => {
									var div_2 = root();
									var node_10 = $.child(div_2);

									Avatar(node_10, {
										class: 'bg-primary text-primary-content font-bold',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('A');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									$.reset(div_2);
									$.append($$anchor, div_2);
								},

								actions: ($$anchor, $$slotProps) => {
									var div_3 = root_1();
									var node_11 = $.child(div_3);

									Button(node_11, {
										get icon() {
											return mdiDotsVertical;
										},
										class: 'w-12 h-12'
									});

									$.reset(div_3);
									$.append($$anchor, div_3);
								}
							}
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_9, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				title: 'Title',
				subheading: 'Subheading',
				$$slots: {
					contents: ($$anchor, $$slotProps) => {
						var div_4 = root_2();

						$.append($$anchor, div_4);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				title: 'Title',
				subheading: 'Subheading',
				$$slots: {
					actions: ($$anchor, $$slotProps) => {
						var div_5 = root_3();
						var node_14 = $.child(div_5);

						Button(node_14, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Action 1');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						var node_15 = $.sibling(node_14, 2);

						Button(node_15, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Action 2');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});

						$.reset(div_5);
						$.append($$anchor, div_5);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_13, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_6();
			var node_17 = $.child(div_6);

			Card(node_17, {
				title: 'Title',
				subheading: 'with actions',
				$$slots: {
					actions: ($$anchor, $$slotProps) => {
						var div_7 = root_3();
						var node_18 = $.child(div_7);

						Button(node_18, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Action 1');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						var node_19 = $.sibling(node_18, 2);

						Button(node_19, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Action 2');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});

						$.reset(div_7);
						$.append($$anchor, div_7);
					}
				}
			});

			var node_20 = $.sibling(node_17, 2);

			Card(node_20, {
				title: 'Title',
				subheading: 'with content',
				$$slots: {
					contents: ($$anchor, $$slotProps) => {
						var div_8 = root_4();

						$.append($$anchor, div_8);
					}
				}
			});

			var node_21 = $.sibling(node_20, 2);

			Card(node_21, {
				title: 'Title',
				subheading: 'with tall content',
				$$slots: {
					contents: ($$anchor, $$slotProps) => {
						var div_9 = root_5();

						$.append($$anchor, div_9);
					}
				}
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_16, 4);

	Preview(node_22, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, { title: 'Title', loading: true });
		},
		$$slots: { default: true }
	});

	var node_23 = $.sibling(node_22, 4);

	Preview(node_23, {
		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				class: 'elevation-none',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Contents');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_23, 4);

	Settings(node_24, {
		components: {
			Card: {
				classes: {
					headerContainer: 'bg-surface-300 border-b',
					header: { title: 'text-3xl' }
				}
			}
		},

		children: ($$anchor, $$slotProps) => {
			Card($$anchor, {
				title: 'Title',
				subheading: 'Subheading',
				$$slots: {
					contents: ($$anchor, $$slotProps) => {
						var div_10 = root_2();

						$.append($$anchor, div_10);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}