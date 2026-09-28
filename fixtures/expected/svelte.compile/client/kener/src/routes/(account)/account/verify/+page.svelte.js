import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"><!></div> <!> <!>`, 1);
var root_1 = $.from_html(`<!> Go to Sign In`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex min-h-screen items-center justify-center p-4"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const error = $.derived(() => $$props.data.error || "Invalid verification link.");
	var div = root_3();

	$.head('ge6egr', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Email Verification';
		});
	});

	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'kener-card w-full max-w-md',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'text-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var div_1 = $.first_child(fragment_1);
							var node_2 = $.child(div_1);

							AlertCircleIcon(node_2, { class: 'h-8 w-8 text-red-600' });
							$.reset(div_1);

							var node_3 = $.sibling(div_1, 2);

							$.component(node_3, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Email Verification Failed');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $.get(error)));
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

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => clientResolver(resolve, "/account/signin"));

								Button($$anchor, {
									get href() {
										return $.get($0);
									},
									class: 'w-full',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										ArrowLeftIcon(node_6, { class: 'mr-2 h-4 w-4' });
										$.next();
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}