import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Field_textarea_demo($$renderer) {
	$$renderer.push(`<div class="w-full max-w-md">`);

	if (Field.Set) {
		$$renderer.push('<!--[-->');

		Field.Set($$renderer, {
			children: ($$renderer) => {
				if (Field.Group) {
					$$renderer.push('<!--[-->');

					Field.Group($$renderer, {
						children: ($$renderer) => {
							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									children: ($$renderer) => {
										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'feedback',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Feedback`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										Textarea($$renderer, {
											id: 'feedback',
											placeholder: 'Your feedback helps us improve...',
											rows: 4
										});

										$$renderer.push(`<!----> `);

										if (Field.Description) {
											$$renderer.push('<!--[-->');

											Field.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Share your thoughts about our service.`);
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