import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import * as FieldSet from '$lib/components/ui/field-set';
import * as Field from '$lib/components/ui/field';

export default function Field_set_destructive($$renderer) {
	$$renderer.push(`<div class="w-full p-6">`);

	if (FieldSet.Root) {
		$$renderer.push('<!--[-->');

		FieldSet.Root($$renderer, {
			variant: 'destructive',
			children: ($$renderer) => {
				if (FieldSet.Content) {
					$$renderer.push('<!--[-->');

					FieldSet.Content($$renderer, {
						children: ($$renderer) => {
							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									children: ($$renderer) => {
										Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Project Name`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);
										Input($$renderer, { value: 'ieedan/std', class: 'max-w-[225px]' });
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

				$$renderer.push(` `);

				if (FieldSet.Footer) {
					$$renderer.push('<!--[-->');

					FieldSet.Footer($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex w-full place-items-center justify-between"><span class="text-muted-foreground text-sm">Rename your project.</span> `);

							Button($$renderer, {
								variant: 'destructive',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Rename`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
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