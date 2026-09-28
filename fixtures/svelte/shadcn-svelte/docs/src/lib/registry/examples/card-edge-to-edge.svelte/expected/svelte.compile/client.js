import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<div class="-mx-(--card-spacing) max-h-48 space-y-4 overflow-y-scroll border-t bg-muted/50 px-(--card-spacing) py-4 text-sm leading-relaxed"><p>These terms govern your use of the workspace, including access to shared documents, project
				files, and collaboration tools.</p> <p>You are responsible for the content you upload and for ensuring that your team has the
				appropriate permissions to view or edit it.</p> <p>We may update features or limits as the service evolves. When those changes materially
				affect your workflow, we will notify your workspace administrators.</p> <p>By continuing, you agree to keep your account credentials secure and to follow your
				organization's acceptable use policies.</p></div>`);

var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Card_edge_to_edge($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'mx-auto w-full max-w-sm',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Terms of Service');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Review the terms before accepting the agreement.');

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

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: '-mb-(--card-spacing)',
						children: ($$anchor, $$slotProps) => {
							var div = root_1();

							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'justify-end gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_6 = $.first_child(fragment_3);

							Button(node_6, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Decline');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Button(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Accept');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
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