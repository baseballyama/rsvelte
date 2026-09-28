import * as $ from 'svelte/internal/server';
import { PhoneInput } from '$lib/components/ui/phone-input';
import Button from '$lib/components/button.svelte';
import * as FieldSet from '$lib/components/ui/field-set';

export default function Phone_number_setting($$renderer) {
	let loading = false;

	if (FieldSet.Root) {
		$$renderer.push('<!--[-->');

		FieldSet.Root($$renderer, {
			children: ($$renderer) => {
				if (FieldSet.Content) {
					$$renderer.push('<!--[-->');

					FieldSet.Content($$renderer, {
						class: 'flex flex-col gap-2',
						children: ($$renderer) => {
							if (FieldSet.Title) {
								$$renderer.push('<!--[-->');

								FieldSet.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Phone Number`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);
							PhoneInput($$renderer, { value: '+1 418 543 8090' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (FieldSet.Footer) {
					$$renderer.push('<!--[-->');

					FieldSet.Footer($$renderer, {
						class: 'flex place-items-center justify-between',
						children: ($$renderer) => {
							$$renderer.push(`<span class="text-muted-foreground text-sm">Add your phone number.</span> `);

							Button($$renderer, {
								loading,
								size: 'sm',
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
									$$renderer.push(`<!---->Save`);
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