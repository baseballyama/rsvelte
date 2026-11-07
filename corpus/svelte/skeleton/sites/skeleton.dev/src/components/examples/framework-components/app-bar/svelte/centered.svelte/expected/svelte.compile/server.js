import * as $ from 'svelte/internal/server';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import CircleUserIcon from '@lucide/svelte/icons/circle-user';
import MenuIcon from '@lucide/svelte/icons/menu';
import SearchIcon from '@lucide/svelte/icons/search';
import { AppBar } from '@skeletonlabs/skeleton-svelte';

export default function Centered($$renderer) {
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
}