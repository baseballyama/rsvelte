import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
import PopcornIcon from "@lucide/svelte/icons/popcorn";
import * as Alert from "$lib/registry/ui/alert/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p>Please verify your billing information and try again.</p> <ul class="list-inside list-disc text-sm"><li>Check your card details</li> <li>Ensure sufficient funds</li> <li>Verify billing address</li></ul>`, 1);
var root_3 = $.from_html(`<div class="grid w-full max-w-xl items-start gap-4"><!> <!> <!></div>`);

export default function Alert_demo($$anchor) {
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Alert.Root, ($$anchor, Alert_Root) => {
		Alert_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				CheckCircle2Icon(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Alert.Title, ($$anchor, Alert_Title) => {
					Alert_Title($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Success! Your changes have been saved');

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

							var text_1 = $.text('This is an alert with icon, title and description.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node, 2);

	$.component(node_4, () => Alert.Root, ($$anchor, Alert_Root_1) => {
		Alert_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_5 = $.first_child(fragment_1);

				PopcornIcon(node_5, {});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => Alert.Title, ($$anchor, Alert_Title_1) => {
					Alert_Title_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('This Alert has a title and an icon. No description.');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node_4, 2);

	$.component(node_7, () => Alert.Root, ($$anchor, Alert_Root_2) => {
		Alert_Root_2($$anchor, {
			variant: 'destructive',
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_8 = $.first_child(fragment_2);

				AlertCircleIcon(node_8, {});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => Alert.Title, ($$anchor, Alert_Title_2) => {
					Alert_Title_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Unable to process your payment.');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_9, 2);

				$.component(node_10, () => Alert.Description, ($$anchor, Alert_Description_1) => {
					Alert_Description_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();

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
}