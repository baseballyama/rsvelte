import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command } from "bits-ui";

import {
	ContactIcon,
	DocsIcon,
	FeedbackIcon,
	PlusIcon,
	ProjectsIcon,
	TeamsIcon
} from "./icons/index.js";

import Item from "./item.svelte";

var root = $.from_html(`<!> Search Projects...`, 1);
var root_1 = $.from_html(`<!> Create New Project...`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> Search Teams...`, 1);
var root_4 = $.from_html(`<!> Create New Team...`, 1);
var root_5 = $.from_html(`<!> Search Docs...`, 1);
var root_6 = $.from_html(`<!> Send Feedback...`, 1);
var root_7 = $.from_html(`<!> Contact Support`, 1);
var root_8 = $.from_html(`<!> <!> <!>`, 1);

export default function Home($$anchor, $$props) {
	var fragment = root_8();
	var node = $.first_child(fragment);

	$.component(node, () => Command.Group, ($$anchor, Command_Group) => {
		Command_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Command.GroupHeading, ($$anchor, Command_GroupHeading) => {
					Command_GroupHeading($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Projects');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.GroupItems, ($$anchor, Command_GroupItems) => {
					Command_GroupItems($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_3 = $.first_child(fragment_2);

							Item(node_3, {
								shortcut: 'S P',
								get onSelect() {
									return $$props.searchProjects;
								},
								value: 'Search Projects...',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									ProjectsIcon(node_4, {});
									$.next();
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_3, 2);

							Item(node_5, {
								value: 'Create New Project...',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_6 = $.first_child(fragment_4);

									PlusIcon(node_6, {});
									$.next();
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node, 2);

	$.component(node_7, () => Command.Group, ($$anchor, Command_Group_1) => {
		Command_Group_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_2();
				var node_8 = $.first_child(fragment_5);

				$.component(node_8, () => Command.GroupHeading, ($$anchor, Command_GroupHeading_1) => {
					Command_GroupHeading_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Teams');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => Command.GroupItems, ($$anchor, Command_GroupItems_1) => {
					Command_GroupItems_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_2();
							var node_10 = $.first_child(fragment_6);

							Item(node_10, {
								shortcut: '⇧ P',
								value: 'Search Teams...',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_3();
									var node_11 = $.first_child(fragment_7);

									TeamsIcon(node_11, {});
									$.next();
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_10, 2);

							Item(node_12, {
								value: 'Create New Team...',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_4();
									var node_13 = $.first_child(fragment_8);

									PlusIcon(node_13, {});
									$.next();
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var node_14 = $.sibling(node_7, 2);

	$.component(node_14, () => Command.Group, ($$anchor, Command_Group_2) => {
		Command_Group_2($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root_2();
				var node_15 = $.first_child(fragment_9);

				$.component(node_15, () => Command.GroupHeading, ($$anchor, Command_GroupHeading_2) => {
					Command_GroupHeading_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Help');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_16 = $.sibling(node_15, 2);

				$.component(node_16, () => Command.GroupItems, ($$anchor, Command_GroupItems_2) => {
					Command_GroupItems_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_8();
							var node_17 = $.first_child(fragment_10);

							Item(node_17, {
								shortcut: '⇧ D',
								value: 'Search Docs...',
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_5();
									var node_18 = $.first_child(fragment_11);

									DocsIcon(node_18, {});
									$.next();
									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_17, 2);

							Item(node_19, {
								value: 'Send Feedback...',
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_6();
									var node_20 = $.first_child(fragment_12);

									FeedbackIcon(node_20, {});
									$.next();
									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_19, 2);

							Item(node_21, {
								value: 'Contact Support',
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_7();
									var node_22 = $.first_child(fragment_13);

									ContactIcon(node_22, {});
									$.next();
									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}