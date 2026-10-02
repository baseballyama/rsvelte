import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Alert from "$lib/registry/ui/alert/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p>Please verify your <a href="#/">billing information</a> and try again.</p> <ul class="list-inside list-disc"><li>Check your card details</li> <li>Ensure sufficient funds</li> <li>Verify billing address</li></ul>`, 1);
var root_2 = $.from_html(`<div class="mx-auto flex w-full max-w-lg flex-col gap-4"><!> <!></div>`);

export default function Alert_destructive($$anchor) {
	Example($$anchor, {
		title: 'Destructive',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			$.component(node, () => Alert.Root, ($$anchor, Alert_Root) => {
				Alert_Root($$anchor, {
					variant: 'destructive',
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

									var text = $.text('Something went wrong!');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Alert.Description, ($$anchor, Alert_Description) => {
							Alert_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Your session has expired. Please log in again.');

									$.append($$anchor, text_1);
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
					variant: 'destructive',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_5 = $.first_child(fragment_2);

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

									var text_2 = $.text('Unable to process your payment.');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Alert.Description, ($$anchor, Alert_Description_1) => {
							Alert_Description_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();

									$.next(2);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
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