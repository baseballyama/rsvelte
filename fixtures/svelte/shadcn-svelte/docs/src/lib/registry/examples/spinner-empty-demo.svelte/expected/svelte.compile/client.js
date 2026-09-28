import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Spinner_empty_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Empty.Root, ($$anchor, Empty_Root) => {
		Empty_Root($$anchor, {
			class: 'w-full border md:p-6',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Empty.Header, ($$anchor, Empty_Header) => {
					Empty_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Empty.Media, ($$anchor, Empty_Media) => {
								Empty_Media($$anchor, {
									variant: 'icon',
									children: ($$anchor, $$slotProps) => {
										Spinner($$anchor, {});
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Empty.Title, ($$anchor, Empty_Title) => {
								Empty_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Processing your request');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Empty.Description, ($$anchor, Empty_Description) => {
								Empty_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Please wait while we process your request. Do not refresh the page.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Empty.Content, ($$anchor, Empty_Content) => {
					Empty_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Cancel');

									$.append($$anchor, text_2);
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

	$.append($$anchor, fragment);
}