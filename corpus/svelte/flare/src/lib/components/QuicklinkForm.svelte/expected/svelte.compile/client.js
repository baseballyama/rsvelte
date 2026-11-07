import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex items-center gap-3 !pl-2.5"><!> <h1 class="text-lg font-medium"> </h1></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p class="text-center text-red-500"> </p>`);

var root_3 = $.from_html(`<div class="grow overflow-y-auto p-6"><div class="mx-auto max-w-xl space-y-6"><div class="grid grid-cols-[120px_1fr] items-center gap-4"><label for="name" class="text-right text-sm text-gray-400">Name</label> <!></div> <div class="grid grid-cols-[120px_1fr] items-start gap-4"><label for="link" class="pt-2 text-right text-sm text-gray-400">Link</label> <div><!> <p class="text-muted-foreground mt-1 text-xs">Include <span class="text-foreground font-mono"></span> for context like
							the selected or copied text in the link.</p></div></div> <div class="grid grid-cols-[120px_1fr] items-center gap-4"><label for="open-with" class="text-right text-sm text-gray-400">Open With</label> <!></div> <div class="grid grid-cols-[120px_1fr] items-center gap-4"><label for="icon" class="text-right text-sm text-gray-400">Icon</label> <!></div> <!></div></div>`);

var root_4 = $.from_html(`<!> Save Quicklink`, 1);

export default function QuicklinkForm($$anchor, $$props) {
	$.push($$props, true);

	let name = $.state($.proxy($$props.quicklink?.name ?? ''));
	let link = $.state($.proxy($$props.quicklink?.link ?? ''));
	let application = $.state($.proxy($$props.quicklink?.application ?? 'Default'));
	let icon = $.state($.proxy($$props.quicklink?.icon ?? 'link-16'));
	let applications = $.state($.proxy([]));
	let error = $.state('');

	onMount(async () => {
		try {
			$.set(applications, await invoke('get_installed_apps'), true);
		} catch(e) {
			console.error('Failed to fetch installed apps:', e);
		}
	});

	async function handleSave() {
		if (!$.get(name).trim()) {
			$.set(error, 'Name cannot be empty');

			return;
		}

		$.set(error, '');

		const data = {
			name: $.get(name),
			link: $.get(link),
			application: $.get(application) === 'Default' ? undefined : $.get(application),
			icon: $.get(icon) === 'link-16' ? undefined : $.get(icon)
		};

		try {
			if ($$props.quicklink) {
				await quicklinksStore.update($$props.quicklink.id, data);
			} else {
				await quicklinksStore.create(data);
			}

			$$props.onSave();
		} catch(e) {
			$.set(error, e instanceof Error ? e.message : String(e), true);
		}
	}

	{
		const header = ($$anchor) => {
			Header($$anchor, {
				showBackButton: true,
				get onPopView() {
					return $$props.onBack;
				},

				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node = $.child(div);

					Icon(node, { icon: 'link-16', class: 'size-6' });

					var h1 = $.sibling(node, 2);
					var text = $.only_child(h1, true);

					$.reset(div);
					$.template_effect(() => $.set_text(text, $$props.quicklink ? 'Edit Quicklink' : 'Create Quicklink'));
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		const content = ($$anchor) => {
			var div_1 = root_3();
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node_1 = $.sibling($.child(div_3), 2);

			Input(node_1, {
				id: 'name',
				placeholder: 'Quicklink name',
				get value() {
					return $.get(name);
				},

				set value($$value) {
					$.set(name, $$value, true);
				}
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var div_5 = $.sibling($.child(div_4), 2);
			var node_2 = $.child(div_5);

			Textarea(node_2, {
				id: 'link',
				placeholder: 'https://google.com/search?q={argument}',
				get value() {
					return $.get(link);
				},

				set value($$value) {
					$.set(link, $$value, true);
				}
			});

			var p = $.sibling(node_2, 2);
			var span = $.sibling($.child(p));

			span.textContent = '{argument}';
			$.next();
			$.reset(p);
			$.reset(div_5);
			$.reset(div_4);

			var div_6 = $.sibling(div_4, 2);
			var node_3 = $.sibling($.child(div_6), 2);

			$.component(node_3, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(application);
					},

					set value($$value) {
						$.set(application, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_4 = $.first_child(fragment_2);

						$.component(node_4, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								id: 'open-with',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									const selectedApp = $.derived(() => $.get(applications).find((a) => a.exec === $.get(application)));

									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, $.get(selectedApp)?.name ?? 'Default'));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
										Select_Item($$anchor, {
											value: 'Default',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Default');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_6, 2);

									$.each(node_7, 17, () => $.get(applications), (app) => app.exec, ($$anchor, app) => {
										var fragment_5 = $.comment();
										var node_8 = $.first_child(fragment_5);

										$.component(node_8, () => Select.Item, ($$anchor, Select_Item_1) => {
											Select_Item_1($$anchor, {
												get value() {
													return $.get(app).exec;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text();

													$.template_effect(() => $.set_text(text_3, $.get(app).name));
													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var node_9 = $.sibling($.child(div_7), 2);

			Input(node_9, {
				id: 'icon',
				placeholder: 'link-16',
				get value() {
					return $.get(icon);
				},

				set value($$value) {
					$.set(icon, $$value, true);
				}
			});

			$.reset(div_7);

			var node_10 = $.sibling(div_7, 2);

			{
				var consequent = ($$anchor) => {
					var p_1 = root_2();
					var text_4 = $.only_child(p_1, true);

					$.template_effect(() => $.set_text(text_4, $.get(error)));
					$.append($$anchor, p_1);
				};

				$.if(node_10, ($$render) => {
					if ($.get(error)) $$render(consequent);
				});
			}

			$.reset(div_2);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		const footer = ($$anchor) => {
			{
				const primaryAction = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(props, {
						onclick: handleSave,
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_4();
							var node_11 = $.first_child(fragment_9);

							Save(node_11, { class: 'mr-2 size-4' });
							$.next();
							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					}));
				};

				ActionBar($$anchor, {
					get icon() {
						return quicklinkIcon;
					},
					title: 'Create Quicklink',
					primaryAction,
					$$slots: { primaryAction: true }
				});
			}
		};

		MainLayout($$anchor, {
			header,
			content,
			footer,
			$$slots: { header: true, content: true, footer: true }
		});
	}

	$.pop();
}