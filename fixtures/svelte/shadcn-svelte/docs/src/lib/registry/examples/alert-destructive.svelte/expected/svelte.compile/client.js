import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
import * as Alert from "$lib/registry/ui/alert/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Alert_destructive($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Alert.Root, ($$anchor, Alert_Root) => {
		Alert_Root($$anchor, {
			variant: 'destructive',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				CircleAlertIcon(node_1, { class: 'size-4' });

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Alert.Title, ($$anchor, Alert_Title) => {
					Alert_Title($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Error');

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

							var text_1 = $.text('Your session has expired. Please login again.');

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

	$.append($$anchor, fragment);
}