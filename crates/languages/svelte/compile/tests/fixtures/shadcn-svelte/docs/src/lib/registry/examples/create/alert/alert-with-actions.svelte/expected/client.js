import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Alert from "$lib/registry/ui/alert/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="mx-auto flex w-full max-w-lg flex-col gap-4"><!> <!></div>`);

export default function Alert_with_actions($$anchor) {
	Example($$anchor, {
		title: 'With Actions',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			$.component(node, () => Alert.Root, ($$anchor, Alert_Root) => {
				Alert_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						IconPlaceholder(node_1, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Alert.Title, ($$anchor, Alert_Title) => {
							Alert_Title($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('The selected emails have been marked as spam.');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Alert.Action, ($$anchor, Alert_Action) => {
							Alert_Action($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										size: 'xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Undo');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => Alert.Root, ($$anchor, Alert_Root_1) => {
				Alert_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_5 = $.first_child(fragment_3);

						IconPlaceholder(node_5, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						var node_6 = $.sibling(node_5, 2);

						$.component(node_6, () => Alert.Title, ($$anchor, Alert_Title_1) => {
							Alert_Title_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('The selected emails have been marked as spam.');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Alert.Description, ($$anchor, Alert_Description) => {
							Alert_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('This is a very long alert title that demonstrates how the component handles extended text\n				content.');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Alert.Action, ($$anchor, Alert_Action_1) => {
							Alert_Action_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Badge($$anchor, {
										variant: 'secondary',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Badge');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}