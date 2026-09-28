import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Alert from "$lib/registry/ui/alert/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Let&apos;s try one with icon, title and a <a href="#/">link</a>.`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`This one has an icon and a description only. No title. <a href="#/">But it has a link</a> and a <a href="#/">second link</a>.`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="mx-auto flex w-full max-w-lg flex-col gap-4"><!> <!> <!> <!> <!> <!></div>`);

export default function Alert_with_icons($$anchor) {
	Example($$anchor, {
		title: 'With Icons',
		children: ($$anchor, $$slotProps) => {
			var div = root_4();
			var node = $.child(div);

			$.component(node, () => Alert.Root, ($$anchor, Alert_Root) => {
				Alert_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
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

									var fragment_2 = root();

									$.next(2);
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

			var node_3 = $.sibling(node, 2);

			$.component(node_3, () => Alert.Root, ($$anchor, Alert_Root_1) => {
				Alert_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_4 = $.first_child(fragment_3);

						IconPlaceholder(node_4, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => Alert.Description, ($$anchor, Alert_Description) => {
							Alert_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_4 = root_2();

									$.next(4);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_3, 2);

			$.component(node_6, () => Alert.Root, ($$anchor, Alert_Root_2) => {
				Alert_Root_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_3();
						var node_7 = $.first_child(fragment_5);

						IconPlaceholder(node_7, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Alert.Title, ($$anchor, Alert_Title_1) => {
							Alert_Title_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Success! Your changes have been saved');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => Alert.Description, ($$anchor, Alert_Description_1) => {
							Alert_Description_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('This is an alert with icon, title and description.');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			var node_10 = $.sibling(node_6, 2);

			$.component(node_10, () => Alert.Root, ($$anchor, Alert_Root_3) => {
				Alert_Root_3($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_1();
						var node_11 = $.first_child(fragment_6);

						IconPlaceholder(node_11, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						var node_12 = $.sibling(node_11, 2);

						$.component(node_12, () => Alert.Title, ($$anchor, Alert_Title_2) => {
							Alert_Title_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('This is a very long alert title that demonstrates how the component handles extended text\n				content and potentially wraps across multiple lines');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			var node_13 = $.sibling(node_10, 2);

			$.component(node_13, () => Alert.Root, ($$anchor, Alert_Root_4) => {
				Alert_Root_4($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_1();
						var node_14 = $.first_child(fragment_7);

						IconPlaceholder(node_14, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						var node_15 = $.sibling(node_14, 2);

						$.component(node_15, () => Alert.Description, ($$anchor, Alert_Description_2) => {
							Alert_Description_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('This is a very long alert description that demonstrates how the component handles extended\n				text content and potentially wraps across multiple lines');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			var node_16 = $.sibling(node_13, 2);

			$.component(node_16, () => Alert.Root, ($$anchor, Alert_Root_5) => {
				Alert_Root_5($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_3();
						var node_17 = $.first_child(fragment_8);

						IconPlaceholder(node_17, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						var node_18 = $.sibling(node_17, 2);

						$.component(node_18, () => Alert.Title, ($$anchor, Alert_Title_3) => {
							Alert_Title_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('This is an extremely long alert title that spans multiple lines to demonstrate how the\n				component handles very lengthy headings while maintaining readability and proper text\n				wrapping behavior');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						var node_19 = $.sibling(node_18, 2);

						$.component(node_19, () => Alert.Description, ($$anchor, Alert_Description_3) => {
							Alert_Description_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('This is an equally long description that contains detailed information about the alert. It\n				shows how the component can accommodate extensive content while preserving proper spacing,\n				alignment, and readability across different screen sizes and viewport widths. This helps\n				ensure the user experience remains consistent regardless of the content length.');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
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