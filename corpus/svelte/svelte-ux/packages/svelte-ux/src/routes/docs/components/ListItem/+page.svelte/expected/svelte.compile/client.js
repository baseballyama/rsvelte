import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiAccount, mdiChevronRight } from '@mdi/js';
import { Button, Checkbox, ListItem, Radio } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div slot="actions"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div slot="avatar" class="contents"><!></div>`);
var root_3 = $.from_html(`<div class="rounded border"></div>`);
var root_4 = $.from_html(`<div class="elevation-1 rounded"><!></div>`);
var root_5 = $.from_html(`<div class="grid gap-4"></div>`);
var root_6 = $.from_html(`<div><!></div>`);
var root_7 = $.from_html(`<div class="grid gap-4 bg-surface-200 p-4"></div>`);
var root_8 = $.from_html(`<h1>Examples</h1> <h2>Title only</h2> <!> <h2>Title with subheading</h2> <!> <h2>Icon</h2> <!> <h2>Icon with subheading</h2> <!> <h2>Icon with classes</h2> <!> <h2>Actions</h2> <!> <h2>Multiple</h2> <!> <h2>Loading</h2> <!> <h2>Radio Group</h2> <h3>example 1</h3> <!> <h2>Radio Group</h2> <h3>example 2</h3> <!> <h3>example 3</h3> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let selectedId = 1;

	const choices = [
		{
			id: 1,
			name: 'Allow all actions',
			description: 'Any action can be used, regardless of who authored it or where it is defined.'
		},

		{
			id: 2,
			name: 'Disable actions',
			description: 'The Actions tab is hidden and no workflows can run.'
		},

		{
			id: 3,
			name: 'Allow local actions only',
			description: 'Only actions defined in a repository within techniq can be used.'
		},

		{
			id: 4,
			name: 'Allow select actions',
			description: 'Only actions that match specified criteria, plus actions defined in a repository within techniq, can be used.'
		}
	];

	var fragment = root_8();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			ListItem($$anchor, { title: 'Title' });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			ListItem($$anchor, { title: 'Title', subheading: 'Subheading' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			ListItem($$anchor, {
				title: 'Title',
				get icon() {
					return mdiAccount;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			ListItem($$anchor, {
				title: 'Title',
				subheading: 'Subheading',
				get icon() {
					return mdiAccount;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			ListItem($$anchor, {
				title: 'Title',
				subheading: 'Subheading',
				get icon() {
					return mdiAccount;
				},
				avatar: { class: 'bg-surface-content/50 text-surface-100/90' }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			ListItem($$anchor, {
				title: 'Title',
				$$slots: {
					actions: ($$anchor, $$slotProps) => {
						var div = root();
						var node_6 = $.child(div);

						Button(node_6, {
							get icon() {
								return mdiChevronRight;
							},
							class: 'p-2 text-surface-content/50'
						});

						$.reset(div);
						$.append($$anchor, div);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_5, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_1();
			var node_8 = $.first_child(fragment_7);

			ListItem(node_8, { title: 'Title' });

			var node_9 = $.sibling(node_8, 2);

			ListItem(node_9, { title: 'Title' });

			var node_10 = $.sibling(node_9, 2);

			ListItem(node_10, { title: 'Title' });

			var node_11 = $.sibling(node_10, 2);

			ListItem(node_11, { title: 'Title' });
			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_7, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_1();
			var node_13 = $.first_child(fragment_8);

			ListItem(node_13, { title: 'Title', subheading: 'Subheading' });

			var node_14 = $.sibling(node_13, 2);

			ListItem(node_14, { title: 'Title', subheading: 'Subheading' });

			var node_15 = $.sibling(node_14, 2);

			ListItem(node_15, { title: 'Title', subheading: 'Subheading', loading: true });

			var node_16 = $.sibling(node_15, 2);

			ListItem(node_16, { title: 'Title', subheading: 'Subheading' });
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_12, 6);

	Preview(node_17, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_3();

			$.each(div_1, 21, () => choices, $.index, ($$anchor, choice) => {
				{
					let $0 = $.derived(() => cls('cursor-pointer', 'hover:bg-primary/5', selectedId == $.get(choice).id ? 'bg-primary/5' : ''));

					ListItem($$anchor, {
						get title() {
							return $.get(choice).name;
						},

						get subheading() {
							return $.get(choice).description;
						},

						get class() {
							return $.get($0);
						},
						$$events: { click: () => selectedId = $.get(choice).id },
						$$slots: {
							avatar: ($$anchor, $$slotProps) => {
								var div_2 = root_2();
								var node_18 = $.child(div_2);

								{
									let $0 = $.derived(() => selectedId === $.get(choice).id);

									Radio(node_18, {
										get checked() {
											return $.get($0);
										}
									});
								}

								$.reset(div_2);
								$.append($$anchor, div_2);
							}
						}
					});
				}
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_17, 6);

	Preview(node_19, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_5();

			$.each(div_3, 21, () => choices, $.index, ($$anchor, choice) => {
				var div_4 = root_4();
				var node_20 = $.child(div_4);

				{
					let $0 = $.derived(() => cls('px-8 py-4', 'cursor-pointer ring ring-inset ring-primary transition-shadow duration-100', 'hover:bg-primary/5', selectedId == $.get(choice).id ? 'ring-1 bg-primary/5' : 'ring-0'));

					ListItem(node_20, {
						get title() {
							return $.get(choice).name;
						},

						get subheading() {
							return $.get(choice).description;
						},

						get class() {
							return $.get($0);
						},
						noShadow: true,
						$$events: { click: () => selectedId = $.get(choice).id }
					});
				}

				$.reset(div_4);
				$.append($$anchor, div_4);
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_19, 4);

	Preview(node_21, {
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_7();

			$.each(div_5, 21, () => choices, $.index, ($$anchor, choice) => {
				var div_6 = root_6();
				var node_22 = $.child(div_6);

				{
					let $0 = $.derived(() => cls('px-8 py-4', 'cursor-pointer transition-shadow duration-100', 'hover:bg-surface-100 hover:outline', selectedId == $.get(choice).id ? 'bg-surface-100 shadow-md' : ''));

					ListItem(node_22, {
						get title() {
							return $.get(choice).name;
						},

						get subheading() {
							return $.get(choice).description;
						},

						get class() {
							return $.get($0);
						},
						noBackground: true,
						noShadow: true,
						$$events: { click: () => selectedId = $.get(choice).id },
						$$slots: {
							actions: ($$anchor, $$slotProps) => {
								var div_7 = root();
								var node_23 = $.child(div_7);

								{
									let $0 = $.derived(() => selectedId == $.get(choice).id);

									Checkbox(node_23, {
										circle: true,
										dense: true,
										get checked() {
											return $.get($0);
										}
									});
								}

								$.reset(div_7);
								$.append($$anchor, div_7);
							}
						}
					});
				}

				$.reset(div_6);
				$.append($$anchor, div_6);
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}