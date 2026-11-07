import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Cover_art($$renderer) {
	let fileInput = void 0;

	function openPicker() {
		fileInput?.click();
	}

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						class: 'flex flex-col gap-3',
						children: ($$renderer) => {
							Label($$renderer, {
								for: 'cover-art',
								class: 'text-center text-xs font-normal tracking-wider text-muted-foreground uppercase',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cover Art`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							if (Item.Root) {
								$$renderer.push('<!--[-->');

								Item.Root($$renderer, {
									class: 'aspect-square',
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<label for="cover-art" class="flex size-full cursor-pointer items-center justify-center">`);

										IconPlaceholder($$renderer, {
											lucide: 'ImageIcon',
											tabler: 'IconPhoto',
											hugeicons: 'Image01Icon',
											phosphor: 'ImageIcon',
											remixicon: 'RiImageLine',
											class: 'size-10 text-muted-foreground/50'
										});

										$$renderer.push(`<!----></label>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <input id="cover-art" type="file" accept="image/jpeg,image/png" class="sr-only"/>`);
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
								variant: 'secondary',
								class: 'w-full',
								type: 'button',
								onclick: openPicker,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Upload Artwork`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									class: 'text-center text-xs',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Minimum 3000 × 3000px <br/> JPEG or PNG only`);
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
}