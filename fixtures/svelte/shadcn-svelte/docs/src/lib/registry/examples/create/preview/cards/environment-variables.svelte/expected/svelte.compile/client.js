import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2 rounded-md px-2.5 py-2 font-mono text-xs ring ring-border"><span class="font-medium"> </span> <span class="ml-auto text-muted-foreground"> </span></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Environment_variables($$anchor) {
	const envVars = [
		{ key: "DATABASE_URL", masked: true },
		{ key: "NEXT_PUBLIC_API", masked: false },
		{ key: "STRIPE_SECRET", masked: true }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
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

										var text = $.text('Environment Variables');

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

										var text_1 = $.text('Production · 8 variables');

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
						class: 'flex flex-col gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.each(node_5, 17, () => envVars, $.index, ($$anchor, env) => {
								var div = root_1();
								var span = $.child(div);
								var text_2 = $.only_child(span, true);
								var span_1 = $.sibling(span, 2);
								var text_3 = $.only_child(span_1, true);

								$.reset(div);

								$.template_effect(() => {
									$.set_text(text_2, $.get(env).key);
									$.set_text(text_3, $.get(env).masked ? "••••••••" : "https://api.example.com");
								});

								$.append($$anchor, div);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_4, 2);

				$.component(node_6, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_7 = $.first_child(fragment_4);

							Button(node_7, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Edit');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							Button(node_8, {
								class: 'ml-auto',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Deploy');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
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