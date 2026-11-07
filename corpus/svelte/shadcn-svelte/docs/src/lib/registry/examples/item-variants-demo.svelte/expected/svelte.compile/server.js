import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Item_variants_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-col gap-6">`);

	if (Item.Root) {
		$$renderer.push('<!--[-->');

		Item.Root($$renderer, {
			children: ($$renderer) => {
				if (Item.Content) {
					$$renderer.push('<!--[-->');

					Item.Content($$renderer, {
						children: ($$renderer) => {
							if (Item.Title) {
								$$renderer.push('<!--[-->');

								Item.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Default Variant`);
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
										$$renderer.push(`<!---->Standard styling with subtle background and borders.`);
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

				if (Item.Actions) {
					$$renderer.push('<!--[-->');

					Item.Actions($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Open`);
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

	if (Item.Root) {
		$$renderer.push('<!--[-->');

		Item.Root($$renderer, {
			variant: 'outline',
			children: ($$renderer) => {
				if (Item.Content) {
					$$renderer.push('<!--[-->');

					Item.Content($$renderer, {
						children: ($$renderer) => {
							if (Item.Title) {
								$$renderer.push('<!--[-->');

								Item.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Outline Variant`);
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
										$$renderer.push(`<!---->Outlined style with clear borders and transparent background.`);
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

				if (Item.Actions) {
					$$renderer.push('<!--[-->');

					Item.Actions($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Open`);
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

	if (Item.Root) {
		$$renderer.push('<!--[-->');

		Item.Root($$renderer, {
			variant: 'muted',
			children: ($$renderer) => {
				if (Item.Content) {
					$$renderer.push('<!--[-->');

					Item.Content($$renderer, {
						children: ($$renderer) => {
							if (Item.Title) {
								$$renderer.push('<!--[-->');

								Item.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Muted Variant`);
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
										$$renderer.push(`<!---->Subdued appearance with muted colors for secondary content.`);
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

				if (Item.Actions) {
					$$renderer.push('<!--[-->');

					Item.Actions($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Open`);
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

	$$renderer.push(`</div>`);
}