import * as $ from 'svelte/internal/server';
import '../app.css';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MenuIcon from '@lucide/svelte/icons/menu';
import * as Sheet from '$site/components/ui/sheet';
import { Button } from '$site/components/ui/button';
import NavBar from './NavBar.svelte';
import LogoAndMenu from './LogoAndMenu.svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		maplibregl.setWorkerUrl(maplibreWorkerUrl);

		let { children } = $$props;
		let drawerOpen = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="bg-background text-foreground flex h-full w-full flex-col"><header class="flex items-center gap-3 border-b px-4 py-2 lg:hidden">`);

			if (Sheet.Root) {
				$$renderer.push('<!--[-->');

				Sheet.Root($$renderer, {
					get open() {
						return drawerOpen;
					},

					set open($$value) {
						drawerOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'ghost',
										size: 'icon',
										'aria-label': 'Toggle menu',
										children: ($$renderer) => {
											MenuIcon($$renderer, { class: 'size-6' });
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Sheet.Trigger) {
								$$renderer.push('<!--[-->');
								Sheet.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Sheet.Content) {
							$$renderer.push('<!--[-->');

							Sheet.Content($$renderer, {
								side: 'left',
								class: 'w-80 p-0',
								children: ($$renderer) => {
									if (Sheet.Header) {
										$$renderer.push('<!--[-->');

										Sheet.Header($$renderer, {
											class: 'sr-only',
											children: ($$renderer) => {
												if (Sheet.Title) {
													$$renderer.push('<!--[-->');

													Sheet.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Navigation`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Sheet.Description) {
													$$renderer.push('<!--[-->');

													Sheet.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Site navigation links`);
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
									NavBar($$renderer, { close: () => drawerOpen = false });
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
			LogoAndMenu($$renderer, {});
			$$renderer.push(`<!----></header> <div class="flex flex-1 overflow-hidden"><aside class="bg-sidebar hidden w-72 shrink-0 border-r lg:block">`);
			NavBar($$renderer, {});
			$$renderer.push(`<!----></aside> <main class="flex-1 overflow-auto p-4">`);
			children?.($$renderer);
			$$renderer.push(`<!----></main></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}