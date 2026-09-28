import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";

export default function Item_header_demo($$renderer) {
	const models = [
		{
			name: "v0-1.5-sm",
			description: "Everyday tasks and UI generation.",
			image: "https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop",
			credit: "Valeria Reverdo on Unsplash"
		},

		{
			name: "v0-1.5-lg",
			description: "Advanced thinking or reasoning.",
			image: "https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop",
			credit: "Michael Oeser on Unsplash"
		},

		{
			name: "v0-2.0-mini",
			description: "Open Source model for everyone.",
			image: "https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop",
			credit: "Cherry Laithang on Unsplash"
		}
	];

	$$renderer.push(`<div class="flex w-full max-w-xl flex-col gap-6">`);

	if (Item.Group) {
		$$renderer.push('<!--[-->');

		Item.Group($$renderer, {
			class: 'grid grid-cols-3 gap-4',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(models);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let model = each_array[$$index];

					if (Item.Root) {
						$$renderer.push('<!--[-->');

						Item.Root($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								if (Item.Header) {
									$$renderer.push('<!--[-->');

									Item.Header($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<img${$.attr('src', model.image)}${$.attr('alt', model.name)} width="128" height="128" class="aspect-square w-full rounded-sm object-cover"/>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Item.Content) {
									$$renderer.push('<!--[-->');

									Item.Content($$renderer, {
										children: ($$renderer) => {
											if (Item.Title) {
												$$renderer.push('<!--[-->');

												Item.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(model.name)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Item.Description) {
												$$renderer.push('<!--[-->');

												Item.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(model.description)}`);
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

				$$renderer.push(`<!--]-->`);
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