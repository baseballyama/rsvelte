import * as $ from 'svelte/internal/server';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import KeyboardShortcut from '$lib/components/KeyboardShortcut.svelte';
import { keyEventMatches } from '$lib/props/actions';
import { focusManager } from '$lib/focus.svelte';

export default function Toast($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { toast, onToastAction } = $$props;
		let open = false;
		const scopeId = `toast-menu-${crypto.randomUUID()}`;

		const actions = $.derived(() => {
			if (!toast) return [];

			const availableActions = [];

			if (toast.primaryAction) {
				availableActions.push({ type: 'primary', ...toast.primaryAction });
			}

			if (toast.secondaryAction) {
				availableActions.push({ type: 'secondary', ...toast.secondaryAction });
			}

			return availableActions;
		});

		const handleKeydown = (e) => {
			if (e.key.toLowerCase() === 't' && (e.ctrlKey || e.metaKey)) {
				if (actions().length > 0) {
					e.preventDefault();
					open = !open;
				}
			} else if (toast?.primaryAction?.shortcut && keyEventMatches(e, toast.primaryAction.shortcut)) {
				handleActionSelect('primary');
			} else if (toast?.secondaryAction?.shortcut && keyEventMatches(e, toast.secondaryAction.shortcut)) {
				handleActionSelect('secondary');
			}
		};

		const handleActionSelect = (actionType) => {
			if (onToastAction) {
				onToastAction(toast.id, actionType);
			}

			open = false;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								$$renderer.push(`<div${$.attributes({ ...props, class: 'flex items-baseline gap-2' })}><div class="flex size-4 items-center justify-center">`);

								if (toast.style === 'ANIMATED') {
									$$renderer.push(`<!--[0--><div class="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>`);
								} else if (toast.style === 'SUCCESS') {
									$$renderer.push(`<!--[1--><div class="shadow-glow size-2 rounded-full bg-green-500 shadow-green-500"></div>`);
								} else if (toast.style === 'FAILURE') {
									$$renderer.push(`<!--[2--><div class="shadow-glow size-2 rounded-full bg-red-500 shadow-red-500"></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div> <div><span>${$.escape(toast.title)}</span> <span class="text-muted-foreground text-sm">${$.escape(toast.message)}</span></div> `);

								if (toast.primaryAction || toast.secondaryAction) {
									$$renderer.push('<!--[0-->');
									KeyboardShortcut($$renderer, { shortcut: { key: 't', modifiers: ['ctrl'] } });
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div>`);
							}

							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');
								DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								side: 'top',
								align: 'start',
								class: 'w-60',
								children: ($$renderer) => {
									if (DropdownMenu.Label) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Label($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Toast Actions`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (DropdownMenu.Separator) {
										$$renderer.push('<!--[-->');
										DropdownMenu.Separator($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <!--[-->`);

									const each_array = $.ensure_array_like(actions());

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let action = each_array[$$index];

										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												onclick: () => handleActionSelect(action.type),
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(action.title)} `);

													if (action.shortcut) {
														$$renderer.push('<!--[0-->');

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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}