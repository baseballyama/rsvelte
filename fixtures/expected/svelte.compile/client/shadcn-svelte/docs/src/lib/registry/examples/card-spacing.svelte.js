import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<form><div class="flex flex-col gap-6"><div class="grid gap-2"><!> <!></div> <div class="grid gap-2"><div class="flex items-center"><!> <a href="##" class="ml-auto inline-block text-sm underline-offset-4 hover:underline">Forgot your password?</a></div> <!></div></div></form>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="mx-auto grid w-full max-w-sm gap-4"><!> <!></div>`);

export default function Card_spacing($$anchor) {
	const spacingOptions = [
		{
			className: "[--card-spacing:--spacing(4)]",
			label: "16px",
			value: "4"
		},

		{
			className: "[--card-spacing:--spacing(5)]",
			label: "20px",
			value: "5"
		},

		{
			className: "[--card-spacing:--spacing(6)]",
			label: "24px",
			value: "6"
		},

		{
			className: "[--card-spacing:--spacing(8)]",
			label: "32px",
			value: "8"
		}
	];

	let spacing = $.state("4");
	let selectedSpacing = $.derived(() => spacingOptions.find((option) => option.value === $.get(spacing)));
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
		ToggleGroup_Root($$anchor, {
			type: 'single',
			variant: 'outline',
			size: 'sm',
			class: 'justify-center',
			get value() {
				return $.get(spacing);
			},

			set value($$value) {
				$.set(spacing, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.each(node_1, 17, () => spacingOptions, (option) => option.value, ($$anchor, option) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
						ToggleGroup_Item($$anchor, {
							get value() {
								return $.get(option).value;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, $.get(option).label));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(selectedSpacing)?.className);

		$.component(node_3, () => Card.Root, ($$anchor, Card_Root) => {
			Card_Root($$anchor, {
				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => Card.Header, ($$anchor, Card_Header) => {
						Card_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => Card.Title, ($$anchor, Card_Title) => {
									Card_Title($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Login to your account');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Card.Description, ($$anchor, Card_Description) => {
									Card_Description($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Enter your email below to login to your account');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => Card.Action, ($$anchor, Card_Action) => {
									Card_Action($$anchor, {
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												variant: 'link',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Sign Up');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_4, 2);

					$.component(node_8, () => Card.Content, ($$anchor, Card_Content) => {
						Card_Content($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var form = root_1();
								var div_1 = $.child(form);
								var div_2 = $.child(div_1);
								var node_9 = $.child(div_2);

								Label(node_9, {
									for: 'email-spacing',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Email');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								var node_10 = $.sibling(node_9, 2);

								Input(node_10, {
									id: 'email-spacing',
									type: 'email',
									placeholder: 'm@example.com',
									required: true
								});

								$.reset(div_2);

								var div_3 = $.sibling(div_2, 2);
								var div_4 = $.child(div_3);
								var node_11 = $.child(div_4);

								Label(node_11, {
									for: 'password-spacing',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Password');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});

								$.next(2);
								$.reset(div_4);

								var node_12 = $.sibling(div_4, 2);

								Input(node_12, { id: 'password-spacing', type: 'password', required: true });
								$.reset(div_3);
								$.reset(div_1);
								$.reset(form);
								$.append($$anchor, form);
							},
							$$slots: { default: true }
						});
					});

					var node_13 = $.sibling(node_8, 2);

					$.component(node_13, () => Card.Footer, ($$anchor, Card_Footer) => {
						Card_Footer($$anchor, {
							class: 'flex-col gap-2',
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_2();
								var node_14 = $.first_child(fragment_6);

								Button(node_14, {
									type: 'submit',
									class: 'w-full',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Login');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});

								var node_15 = $.sibling(node_14, 2);

								Button(node_15, {
									variant: 'outline',
									class: 'w-full',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('Login with Google');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}