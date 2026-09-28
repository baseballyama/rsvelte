import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getComponentDialogCtx } from './component-dialog-context.svelte';
import Content from './content.svelte';
import * as Dialog from '$lib/demo/ui/dialog/index.js';
import * as Drawer from '$lib/demo/ui/drawer/index.js';
import { pushState, replaceState } from '$app/navigation';
import { page } from '$app/state';
import { untrack } from 'svelte';
import { MediaQuery } from 'svelte/reactivity';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="block h-auto max-h-[calc(80svh)] overflow-y-auto sm:max-w-2xl"><!></div>`);

export default function Component_dialog($$anchor, $$props) {
	$.push($$props, true);

	const screen = new MediaQuery('(min-width: 768px)');
	const componentDialogCtx = getComponentDialogCtx();
	const originalPath = page.url.pathname;
	let open = $.derived(() => !!componentDialogCtx.component);
	let statePushed = $.state(false);
	const targetPath = $.derived(() => `${page.url.pathname}/${componentDialogCtx.component?.name}`);

	$.user_effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		$.get(open);

		untrack(() => {
			if ($.get(open) && page.url.pathname !== $.get(targetPath)) {
				pushState($.get(targetPath), {});
				$.set(statePushed, true);
			}
		});
	});

	function handleOpenChange(open) {
		if (!open && $.get(statePushed)) {
			replaceState(originalPath, {});
			$.set(statePushed, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					onOpenChange: handleOpenChange,
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
							Dialog_Portal($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
										Dialog_Overlay($$anchor, {});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
										Dialog_Content($$anchor, {
											class: 'block h-auto max-h-[calc(80svh)] max-w-[calc(100svw-5rem)] overflow-y-auto sm:max-w-2xl',
											children: ($$anchor, $$slotProps) => {
												Content($$anchor, {
													get component() {
														return componentDialogCtx.component;
													},

													onGotoComponent: () => {
														$.set(open, false);
														replaceState(originalPath, {});
													}
												});
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_5 = $.first_child(fragment_5);

			$.component(node_5, () => Drawer.Root, ($$anchor, Drawer_Root) => {
				Drawer_Root($$anchor, {
					onOpenChange: handleOpenChange,
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_6 = $.comment();
						var node_6 = $.first_child(fragment_6);

						$.component(node_6, () => Drawer.Content, ($$anchor, Drawer_Content) => {
							Drawer_Content($$anchor, {
								class: 'overflow-hidden after:[all:unset]!',
								children: ($$anchor, $$slotProps) => {
									var div = root_1();
									var node_7 = $.child(div);

									Content(node_7, {
										get component() {
											return componentDialogCtx.component;
										},

										onGotoComponent: () => {
											$.set(open, false);
											replaceState(originalPath, {});
										}
									});

									$.reset(div);
									$.append($$anchor, div);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_5);
		};

		$.if(node, ($$render) => {
			if (screen.current) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}