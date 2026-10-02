import * as $ from 'svelte/internal/server';
import MoonIcon from '@lucide/svelte/icons/moon';
import SunIcon from '@lucide/svelte/icons/sun';
import { Switch } from '@skeletonlabs/skeleton-svelte';

export default function Thumb_icons($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Switch($$renderer, {
			children: ($$renderer) => {
				if (Switch.Control) {
					$$renderer.push('<!--[-->');

					Switch.Control($$renderer, {
						children: ($$renderer) => {
							if (Switch.Thumb) {
								$$renderer.push('<!--[-->');

								Switch.Thumb($$renderer, {
									children: ($$renderer) => {
										{
											function children($$renderer, switch_) {
												if (switch_().checked) {
													$$renderer.push('<!--[0-->');
													SunIcon($$renderer, { class: 'size-3' });
												} else {
													$$renderer.push('<!--[-1-->');
													MoonIcon($$renderer, { class: 'size-3' });
												}

												$$renderer.push(`<!--]-->`);
											}

											if (Switch.Context) {
												$$renderer.push('<!--[-->');
												Switch.Context($$renderer, { children, $$slots: { default: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
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

				$$renderer.push(` `);

				if (Switch.HiddenInput) {
					$$renderer.push('<!--[-->');
					Switch.HiddenInput($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	});
}