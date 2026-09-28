import * as $ from 'svelte/internal/server';
import { IPv4AddressInput } from '$lib/components/ui/ipv4address-input';
import * as Card from '$lib/components/ui/card';
import { Label } from '$lib/components/ui/label';
import Button from '$lib/components/button.svelte';

export default function Configure_device($$renderer) {
	let loading = false;

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Network Configuration`);
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
										$$renderer.push(`<!---->Configure device network settings.`);
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
						class: 'flex flex-col gap-4',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex flex-col gap-2"><div class="flex place-items-center justify-between gap-2">`);

							Label($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->IP Address`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							IPv4AddressInput($$renderer, { value: '172 16 230 22' });
							$$renderer.push(`<!----></div> <div class="flex place-items-center justify-between gap-2">`);

							Label($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Subnet Mask`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							IPv4AddressInput($$renderer, { value: '255 255 255 0' });
							$$renderer.push(`<!----></div> <div class="flex place-items-center justify-between gap-2">`);

							Label($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Gateway`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							IPv4AddressInput($$renderer, { placeholder: '0 0 0 0' });
							$$renderer.push(`<!----></div></div> `);

							Button($$renderer, {
								loading,
								class: 'w-full',
								onclick: () => {
									loading = true;

									setTimeout(
										() => {
											loading = false;
										},
										500
									);
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->Configure`);
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
}