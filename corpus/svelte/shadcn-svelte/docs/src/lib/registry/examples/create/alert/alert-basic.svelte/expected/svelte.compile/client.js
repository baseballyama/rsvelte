import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Alert from "$lib/registry/ui/alert/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="mx-auto flex w-full max-w-lg flex-col gap-4"><!> <!> <!></div>`);

export default function Alert_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			$.component(node, () => Alert.Root, ($$anchor, Alert_Root) => {
				Alert_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Alert.Title, ($$anchor, Alert_Title) => {
							Alert_Title($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Success! Your changes have been saved.');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => Alert.Root, ($$anchor, Alert_Root_1) => {
				Alert_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => Alert.Title, ($$anchor, Alert_Title_1) => {
							Alert_Title_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Success! Your changes have been saved.');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Alert.Description, ($$anchor, Alert_Description) => {
							Alert_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('This is an alert with title and description.');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node_2, 2);

			$.component(node_5, () => Alert.Root, ($$anchor, Alert_Root_2) => {
				Alert_Root_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_6 = $.first_child(fragment_3);

						$.component(node_6, () => Alert.Description, ($$anchor, Alert_Description_1) => {
							Alert_Description_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('This one has a description only. No title. No icon.');

									$.append($$anchor, text_3);
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