import * as $ from 'svelte/internal/server';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";

export default function Breadcrumb_ellipsis($$renderer) {
	if (Breadcrumb.Root) {
		$$renderer.push('<!--[-->');

		Breadcrumb.Root($$renderer, {
			children: ($$renderer) => {
				if (Breadcrumb.List) {
					$$renderer.push('<!--[-->');

					Breadcrumb.List($$renderer, {
						children: ($$renderer) => {
							if (Breadcrumb.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Item($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.Link) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Link($$renderer, {
												href: '/',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Home`);
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

							if (Breadcrumb.Separator) {
								$$renderer.push('<!--[-->');
								Breadcrumb.Separator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Breadcrumb.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Item($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.Ellipsis) {
											$$renderer.push('<!--[-->');
											Breadcrumb.Ellipsis($$renderer, {});
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

							if (Breadcrumb.Separator) {
								$$renderer.push('<!--[-->');
								Breadcrumb.Separator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Breadcrumb.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Item($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.Link) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Link($$renderer, {
												href: '/docs/components',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Components`);
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

							if (Breadcrumb.Separator) {
								$$renderer.push('<!--[-->');
								Breadcrumb.Separator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Breadcrumb.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Item($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.Page) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Page($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Breadcrumb`);
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
}