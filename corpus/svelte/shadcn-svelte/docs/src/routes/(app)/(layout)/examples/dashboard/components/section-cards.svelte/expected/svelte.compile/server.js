import * as $ from 'svelte/internal/server';
import TrendingDownIcon from "@tabler/icons-svelte/icons/trending-down";
import TrendingUpIcon from "@tabler/icons-svelte/icons/trending-up";
import * as Card from "$lib/registry/ui/card/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Section_cards($$renderer) {
	$$renderer.push(`<div class="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">`);

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			class: '@container/card',
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Total Revenue`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									class: 'text-2xl font-semibold tabular-nums @[250px]/card:text-3xl',
									children: ($$renderer) => {
										$$renderer.push(`<!---->$1,250.00`);
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
										Badge($$renderer, {
											variant: 'outline',
											children: ($$renderer) => {
												TrendingUpIcon($$renderer, {});
												$$renderer.push(`<!----> +12.5%`);
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

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						class: 'flex-col items-start gap-1.5 text-sm',
						children: ($$renderer) => {
							$$renderer.push(`<div class="line-clamp-1 flex gap-2 font-medium">Trending up this month `);
							TrendingUpIcon($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----></div> <div class="text-muted-foreground">Visitors for the last 6 months</div>`);
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

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			class: '@container/card',
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->New Customers`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									class: 'text-2xl font-semibold tabular-nums @[250px]/card:text-3xl',
									children: ($$renderer) => {
										$$renderer.push(`<!---->1,234`);
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
										Badge($$renderer, {
											variant: 'outline',
											children: ($$renderer) => {
												TrendingDownIcon($$renderer, {});
												$$renderer.push(`<!----> -20%`);
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

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						class: 'flex-col items-start gap-1.5 text-sm',
						children: ($$renderer) => {
							$$renderer.push(`<div class="line-clamp-1 flex gap-2 font-medium">Down 20% this period `);
							TrendingDownIcon($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----></div> <div class="text-muted-foreground">Acquisition needs attention</div>`);
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

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			class: '@container/card',
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Active Accounts`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									class: 'text-2xl font-semibold tabular-nums @[250px]/card:text-3xl',
									children: ($$renderer) => {
										$$renderer.push(`<!---->45,678`);
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
										Badge($$renderer, {
											variant: 'outline',
											children: ($$renderer) => {
												TrendingUpIcon($$renderer, {});
												$$renderer.push(`<!----> +12.5%`);
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

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						class: 'flex-col items-start gap-1.5 text-sm',
						children: ($$renderer) => {
							$$renderer.push(`<div class="line-clamp-1 flex gap-2 font-medium">Strong user retention `);
							TrendingUpIcon($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----></div> <div class="text-muted-foreground">Engagement exceed targets</div>`);
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

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			class: '@container/card',
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Growth Rate`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									class: 'text-2xl font-semibold tabular-nums @[250px]/card:text-3xl',
									children: ($$renderer) => {
										$$renderer.push(`<!---->4.5%`);
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
										Badge($$renderer, {
											variant: 'outline',
											children: ($$renderer) => {
												TrendingUpIcon($$renderer, {});
												$$renderer.push(`<!----> +4.5%`);
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

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						class: 'flex-col items-start gap-1.5 text-sm',
						children: ($$renderer) => {
							$$renderer.push(`<div class="line-clamp-1 flex gap-2 font-medium">Steady performance increase `);
							TrendingUpIcon($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----></div> <div class="text-muted-foreground">Meets growth projections</div>`);
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