import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/components/ui/avatar/index.js";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";

export default function Nav_user($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { user } = $$props;

		if (Sidebar.Menu) {
			$$renderer.push('<!--[-->');

			Sidebar.Menu($$renderer, {
				class: 'rounded-md border border-dashed bg-secondary/30  hover:border-cyan-500/50 ',
				children: ($$renderer) => {
					if (Sidebar.MenuItem) {
						$$renderer.push('<!--[-->');

						Sidebar.MenuItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<a${$.attr('href', user.visit)} target="_blank" rel="noopener noreferrer">`);

								if (Sidebar.MenuButton) {
									$$renderer.push('<!--[-->');

									Sidebar.MenuButton($$renderer, {
										size: 'lg',
										class: 'cursor-pointer hover:bg-cyan-800/10 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
										children: ($$renderer) => {
											if (Avatar.Root) {
												$$renderer.push('<!--[-->');

												Avatar.Root($$renderer, {
													class: 'size-8 rounded-lg',
													children: ($$renderer) => {
														if (Avatar.Image) {
															$$renderer.push('<!--[-->');
															Avatar.Image($$renderer, { src: user.avatar, alt: user.name });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Avatar.Fallback) {
															$$renderer.push('<!--[-->');

															Avatar.Fallback($$renderer, {
																class: 'rounded-lg',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->CN`);
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

											$$renderer.push(` <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">${$.escape(user.name)}</span> <span class="truncate text-xs text-muted-foreground">${$.escape(user.desc)}</span></div>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</a>`);
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
	});
}