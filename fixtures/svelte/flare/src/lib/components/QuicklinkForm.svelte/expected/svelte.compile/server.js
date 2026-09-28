import * as $ from 'svelte/internal/server';
import { invoke } from '@tauri-apps/api/core';
import { onMount } from 'svelte';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Select from '$lib/components/ui/select';
import Icon from '$lib/components/Icon.svelte';
import { Save } from '@lucide/svelte';
import { quicklinksStore } from '$lib/quicklinks.svelte';
import MainLayout from './layout/MainLayout.svelte';
import Header from './layout/Header.svelte';
import ActionBar from './nodes/shared/ActionBar.svelte';
import quicklinkIcon from '$lib/assets/quicklinks-package-1616x16@2x.png?inline';

export default function QuicklinkForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { quicklink, onBack, onSave } = $$props;
		let name = quicklink?.name ?? '';
		let link = quicklink?.link ?? '';
		let application = quicklink?.application ?? 'Default';
		let icon = quicklink?.icon ?? 'link-16';
		let applications = [];
		let error = '';

		onMount(async () => {
			try {
				applications = await invoke('get_installed_apps');
			} catch(e) {
				console.error('Failed to fetch installed apps:', e);
			}
		});

		async function handleSave() {
			if (!name.trim()) {
				error = 'Name cannot be empty';

				return;
			}

			error = '';

			const data = {
				name,
				link,
				application: application === 'Default' ? undefined : application,
				icon: icon === 'link-16' ? undefined : icon
			};

			try {
				if (quicklink) {
					await quicklinksStore.update(quicklink.id, data);
				} else {
					await quicklinksStore.create(data);
				}

				onSave();
			} catch(e) {
				error = e instanceof Error ? e.message : String(e);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function header($$renderer) {
					Header($$renderer, {
						showBackButton: true,
						onPopView: onBack,
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex items-center gap-3 !pl-2.5">`);
							Icon($$renderer, { icon: 'link-16', class: 'size-6' });
							$$renderer.push(`<!----> <h1 class="text-lg font-medium">${$.escape(quicklink ? 'Edit Quicklink' : 'Create Quicklink')}</h1></div>`);
						},
						$$slots: { default: true }
					});
				}

				function content($$renderer) {
					$$renderer.push(`<div class="grow overflow-y-auto p-6"><div class="mx-auto max-w-xl space-y-6"><div class="grid grid-cols-[120px_1fr] items-center gap-4"><label for="name" class="text-right text-sm text-gray-400">Name</label> `);

					Input($$renderer, {
						id: 'name',
						placeholder: 'Quicklink name',
						get value() {
							return name;
						},

						set value($$value) {
							name = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="grid grid-cols-[120px_1fr] items-start gap-4"><label for="link" class="pt-2 text-right text-sm text-gray-400">Link</label> <div>`);

					Textarea($$renderer, {
						id: 'link',
						placeholder: 'https://google.com/search?q={argument}',
						get value() {
							return link;
						},

						set value($$value) {
							link = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <p class="text-muted-foreground mt-1 text-xs">Include <span class="text-foreground font-mono">{argument}</span> for context like
							the selected or copied text in the link.</p></div></div> <div class="grid grid-cols-[120px_1fr] items-center gap-4"><label for="open-with" class="text-right text-sm text-gray-400">Open With</label> `);

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							type: 'single',
							get value() {
								return application;
							},

							set value($$value) {
								application = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										id: 'open-with',
										class: 'w-full',
										children: ($$renderer) => {
											const selectedApp = applications.find((a) => a.exec === application);

											$$renderer.push(`<!---->${$.escape(selectedApp?.name ?? 'Default')}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'Default',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Default`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <!--[-->`);

											const each_array = $.ensure_array_like(applications);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let app = each_array[$$index];

												if (Select.Item) {
													$$renderer.push('<!--[-->');

													Select.Item($$renderer, {
														value: app.exec,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(app.name)}`);
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div class="grid grid-cols-[120px_1fr] items-center gap-4"><label for="icon" class="text-right text-sm text-gray-400">Icon</label> `);

					Input($$renderer, {
						id: 'icon',
						placeholder: 'link-16',
						get value() {
							return icon;
						},

						set value($$value) {
							icon = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> `);

					if (error) {
						$$renderer.push(`<!--[0--><p class="text-center text-red-500">${$.escape(error)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				function footer($$renderer) {
					{
						function primaryAction($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								props,
								{
									onclick: handleSave,
									children: ($$renderer) => {
										Save($$renderer, { class: 'mr-2 size-4' });
										$$renderer.push(`<!----> Save Quicklink`);
									},
									$$slots: { default: true }
								}
							]));
						}

						ActionBar($$renderer, {
							icon: quicklinkIcon,
							title: 'Create Quicklink',
							primaryAction,
							$$slots: { primaryAction: true }
						});
					}
				}

				MainLayout($$renderer, {
					header,
					content,
					footer,
					$$slots: { header: true, content: true, footer: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}