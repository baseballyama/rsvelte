import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<form><div class="flex flex-col gap-6"><div class="grid gap-2"><!> <!></div> <div class="grid gap-2"><div class="flex items-center"><!> <a href="##" class="ms-auto inline-block text-sm underline-offset-4 hover:underline">Forgot your password?</a></div> <!></div></div></form>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Card_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: '-my-4 w-full max-w-sm',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
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

										var text = $.text('Login to your account');

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

										var text_1 = $.text('Enter your email below to login to your account');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'link',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Sign Up');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
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

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var form = root_1();
							var div = $.child(form);
							var div_1 = $.child(div);
							var node_6 = $.child(div_1);

							Label(node_6, {
								for: 'email',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Email');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Input(node_7, {
								id: 'email',
								type: 'email',
								placeholder: 'm@example.com',
								required: true
							});

							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var div_3 = $.child(div_2);
							var node_8 = $.child(div_3);

							Label(node_8, {
								for: 'password',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Password');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.next(2);
							$.reset(div_3);

							var node_9 = $.sibling(div_3, 2);

							Input(node_9, { id: 'password', type: 'password', required: true });
							$.reset(div_2);
							$.reset(div);
							$.reset(form);
							$.append($$anchor, form);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_5, 2);

				$.component(node_10, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_2();
							var node_11 = $.first_child(fragment_4);

							Button(node_11, {
								type: 'submit',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Login');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							Button(node_12, {
								variant: 'outline',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Login with Google');

									$.append($$anchor, text_6);
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