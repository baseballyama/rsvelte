import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/Icon.svelte';
import { Separator } from '$lib/components/ui/separator/index.js';
import { Button } from '$lib/components/ui/button';
import Toast from './Toast.svelte';
import ActionMenu from './ActionMenu.svelte';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import KeyboardShortcut from '$lib/components/KeyboardShortcut.svelte';
import { keyEventMatches } from '$lib/props';

export default function ActionBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** Optional override to render the primary action button. Prefer not providing if possible. */
		let {
			title,
			icon,
			actions,
			toast = null,
			onToastAction,
			primaryAction: primaryActionOverride
		} = $$props;

		const primaryAction = $.derived(() => actions?.[0] ?? null);

		const handleKeydown = (event) => {
			if (event.key === 'Enter') {
				if (event.target instanceof HTMLElement && event.target.closest('[data-slot="dropdown-menu-content"]')) {
					return;
				}

				event.preventDefault();

				if (!actions?.[0]?.shortcut && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
					actions?.[0]?.handler?.();

					return;
				} else if (!actions?.[1]?.shortcut && event.ctrlKey && !event.metaKey && !event.shiftKey) {
					actions?.[1]?.handler?.();

					return;
				}
			}

			for (const action of actions ?? []) {
				if (action.shortcut && keyEventMatches(event, action.shortcut)) {
					action.handler?.();

					return;
				}
			}
		};

		$$renderer.push(`<footer class="bg-card flex h-10 shrink-0 items-center border-t px-2">`);

		if (toast) {
			$$renderer.push('<!--[0-->');
			Toast($$renderer, { toast, onToastAction });
		} else if (title || icon) {
			$$renderer.push(`<!--[1--><div class="flex min-w-0 items-center gap-2.5 pl-1">`);

			if (icon) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon, class: 'size-5 shrink-0' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (title) {
				$$renderer.push('<!--[0-->');

				if (typeof title === 'string') {
					$$renderer.push(`<!--[0--><span class="text-muted-foreground truncate text-sm">${$.escape(title)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
					title($$renderer);
					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="ml-auto flex items-center">`);

		if (primaryActionOverride) {
			$$renderer.push('<!--[0-->');
			primaryActionOverride($$renderer, { props: { variant: 'ghost', size: 'action' } });
			$$renderer.push(`<!---->`);
		} else if (primaryAction()) {
			$$renderer.push(`<!--[1--><div class="peer order-1">`);

			Button($$renderer, {
				variant: 'ghost',
				size: 'action',
				class: primaryAction().style === 'destructive' ? 'text-destructive' : '',
				onclick: primaryAction().handler,
				disabled: primaryAction().disabled,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(primaryAction().title)} `);
					KeyboardShortcut($$renderer, { shortcut: { modifiers: [], key: 'enter' } });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (actions && actions.length > 1) {
			$$renderer.push(`<!--[0--><div class="peer order-3">`);

			ActionMenu($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(actions);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let action = each_array[i];

						if (DropdownMenu.Item) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Item($$renderer, {
								class: `rounded-md p-2 text-left ${action.style === 'destructive'
									? 'text-destructive focus:text-destructive-foreground focus:bg-destructive'
									: ''}`,
								disabled: action.disabled,
								onclick: action.handler,
								children: ($$renderer) => {
									if (action.icon) {
										$$renderer.push('<!--[0-->');
										Icon($$renderer, { icon: action.icon, class: 'size-4' });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> ${$.escape(action.title)} `);

									if (i == 0) {
										$$renderer.push('<!--[0-->');

										if (DropdownMenu.Shortcut) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Shortcut($$renderer, {
												children: ($$renderer) => {
													KeyboardShortcut($$renderer, { shortcut: { key: 'enter', modifiers: [] } });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else if (i == 1) {
										$$renderer.push('<!--[1-->');

										if (DropdownMenu.Shortcut) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Shortcut($$renderer, {
												children: ($$renderer) => {
													KeyboardShortcut($$renderer, { shortcut: { key: 'enter', modifiers: ['ctrl'] } });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else if (action.shortcut) {
										$$renderer.push('<!--[2-->');

										if (DropdownMenu.Shortcut) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Shortcut($$renderer, {
												children: ($$renderer) => {
													KeyboardShortcut($$renderer, { shortcut: action.shortcut });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
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
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			if (primaryAction() || primaryActionOverride) {
				$$renderer.push('<!--[0-->');

				Separator($$renderer, {
					orientation: 'vertical',
					class: 'order-2 mr-1 ml-2 !h-3 !w-[2px] transition-opacity peer-hover:opacity-0'
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></footer>`);
	});
}