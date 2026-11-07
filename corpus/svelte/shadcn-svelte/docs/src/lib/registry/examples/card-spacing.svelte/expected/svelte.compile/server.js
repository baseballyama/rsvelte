import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Card_spacing($$renderer) {
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

	let spacing = "4";
	let selectedSpacing = $.derived(() => spacingOptions.find((option) => option.value === spacing));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="mx-auto grid w-full max-w-sm gap-4">`);

		if (ToggleGroup.Root) {
			$$renderer.push('<!--[-->');

			ToggleGroup.Root($$renderer, {
				type: 'single',
				variant: 'outline',
				size: 'sm',
				class: 'justify-center',
				get value() {
					return spacing;
				},

				set value($$value) {
					spacing = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(spacingOptions);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let option = each_array[$$index];

						if (ToggleGroup.Item) {
							$$renderer.push('<!--[-->');

							ToggleGroup.Item($$renderer, {
								value: option.value,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option.label)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				class: selectedSpacing()?.className,
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Login to your account`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Enter your email below to login to your account`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Action) {
									$$renderer.push('<!--[-->');

									Card.Action($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												variant: 'link',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Sign Up`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<form><div class="flex flex-col gap-6"><div class="grid gap-2">`);

								Label($$renderer, {
									for: 'email-spacing',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Email`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'email-spacing',
									type: 'email',
									placeholder: 'm@example.com',
									required: true
								});

								$$renderer.push(`<!----></div> <div class="grid gap-2"><div class="flex items-center">`);

								Label($$renderer, {
									for: 'password-spacing',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Password`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> <a href="##" class="ml-auto inline-block text-sm underline-offset-4 hover:underline">Forgot your password?</a></div> `);
								Input($$renderer, { id: 'password-spacing', type: 'password', required: true });
								$$renderer.push(`<!----></div></div></form>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Footer) {
						$$renderer.push('<!--[-->');

						Card.Footer($$renderer, {
							class: 'flex-col gap-2',
							children: ($$renderer) => {
								Button($$renderer, {
									type: 'submit',
									class: 'w-full',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Login`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'outline',
									class: 'w-full',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Login with Google`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}