import * as $ from 'svelte/internal/server';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import CircleUserIcon from '@lucide/svelte/icons/circle-user';
import MenuIcon from '@lucide/svelte/icons/menu';
import SearchIcon from '@lucide/svelte/icons/search';
import { AppBar } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="space-y-10"><header><h2 class="h2">App Bar</h2></header> <section class="space-y-4">`);

	AppBar($$renderer, {
		children: ($$renderer) => {
			if (AppBar.Toolbar) {
				$$renderer.push('<!--[-->');

				AppBar.Toolbar($$renderer, {
					class: 'grid-cols-[auto_1fr_auto]',
					children: ($$renderer) => {
						if (AppBar.Lead) {
							$$renderer.push('<!--[-->');

							AppBar.Lead($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<button type="button" class="btn-icon btn-icon-lg hover:preset-tonal">`);
									MenuIcon($$renderer, {});
									$$renderer.push(`<!----></button>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (AppBar.Headline) {
							$$renderer.push('<!--[-->');

							AppBar.Headline($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<p class="text-2xl">Headline</p>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (AppBar.Trail) {
							$$renderer.push('<!--[-->');

							AppBar.Trail($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<button type="button" class="btn-icon hover:preset-tonal">`);
									SearchIcon($$renderer, { class: 'size-6' });
									$$renderer.push(`<!----></button> <button type="button" class="btn-icon hover:preset-tonal">`);
									CalendarIcon($$renderer, { class: 'size-6' });
									$$renderer.push(`<!----></button> <button type="button" class="btn-icon hover:preset-tonal">`);
									CircleUserIcon($$renderer, { class: 'size-6' });
									$$renderer.push(`<!----></button>`);
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

	$$renderer.push(`<!----></section> <section class="space-y-4"><h3 class="h3">Centered</h3> `);

	AppBar($$renderer, {
		children: ($$renderer) => {
			if (AppBar.Toolbar) {
				$$renderer.push('<!--[-->');

				AppBar.Toolbar($$renderer, {
					class: 'grid-cols-[1fr_2fr_1fr]',
					children: ($$renderer) => {
						if (AppBar.Lead) {
							$$renderer.push('<!--[-->');

							AppBar.Lead($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<button type="button" class="btn-icon btn-icon-lg hover:preset-tonal">`);
									MenuIcon($$renderer, {});
									$$renderer.push(`<!----></button>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (AppBar.Headline) {
							$$renderer.push('<!--[-->');

							AppBar.Headline($$renderer, {
								class: 'flex justify-center',
								children: ($$renderer) => {
									$$renderer.push(`<p>Headline</p>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (AppBar.Trail) {
							$$renderer.push('<!--[-->');

							AppBar.Trail($$renderer, {
								class: 'justify-end',
								children: ($$renderer) => {
									$$renderer.push(`<button type="button" class="btn-icon hover:preset-tonal">`);
									SearchIcon($$renderer, { class: 'size-6' });
									$$renderer.push(`<!----></button> <button type="button" class="btn-icon hover:preset-tonal">`);
									CalendarIcon($$renderer, { class: 'size-6' });
									$$renderer.push(`<!----></button> <button type="button" class="btn-icon hover:preset-tonal">`);
									CircleUserIcon($$renderer, { class: 'size-6' });
									$$renderer.push(`<!----></button>`);
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

	$$renderer.push(`<!----></section> <section class="space-y-4"><h3 class="h3">Extended</h3> `);

	AppBar($$renderer, {
		children: ($$renderer) => {
			if (AppBar.Toolbar) {
				$$renderer.push('<!--[-->');

				AppBar.Toolbar($$renderer, {
					class: 'grid-cols-[auto_auto]',
					children: ($$renderer) => {
						if (AppBar.Lead) {
							$$renderer.push('<!--[-->');

							AppBar.Lead($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<button type="button" class="btn-icon btn-icon-lg hover:preset-tonal">`);
									MenuIcon($$renderer, {});
									$$renderer.push(`<!----></button>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (AppBar.Trail) {
							$$renderer.push('<!--[-->');

							AppBar.Trail($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<button type="button" class="btn-icon hover:preset-tonal">`);
									SearchIcon($$renderer, { class: 'size-6' });
									$$renderer.push(`<!----></button> <button type="button" class="btn-icon hover:preset-tonal">`);
									CalendarIcon($$renderer, { class: 'size-6' });
									$$renderer.push(`<!----></button> <button type="button" class="btn-icon hover:preset-tonal">`);
									CircleUserIcon($$renderer, { class: 'size-6' });
									$$renderer.push(`<!----></button>`);
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

			if (AppBar.Headline) {
				$$renderer.push('<!--[-->');

				AppBar.Headline($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<h2 class="h2">Headline</h2>`);
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

	$$renderer.push(`<!----></section></div>`);
}