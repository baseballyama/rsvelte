import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/Icon.svelte';
import { Separator } from '$lib/components/ui/separator/index.js';
import { Button } from '$lib/components/ui/button';
import Toast from './Toast.svelte';
import ActionMenu from './ActionMenu.svelte';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import KeyboardShortcut from '$lib/components/KeyboardShortcut.svelte';
import { keyEventMatches } from '$lib/props';

var root = $.from_html(`<span class="text-muted-foreground truncate text-sm"> </span>`);
var root_1 = $.from_html(`<div class="flex min-w-0 items-center gap-2.5 pl-1"><!> <!></div>`);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<div class="peer order-1"><!></div>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="peer order-3"><!></div> <!>`, 1);
var root_6 = $.from_html(`<footer class="bg-card flex h-10 shrink-0 items-center border-t px-2"><!> <div class="ml-auto flex items-center"><!> <!></div></footer>`);

export default function ActionBar($$anchor, $$props) {
	$.push($$props, true);

	/** Optional override to render the primary action button. Prefer not providing if possible. */
	let toast = $.prop($$props, 'toast', 3, null);

	const primaryAction = $.derived(() => $$props.actions?.[0] ?? null);

	const handleKeydown = (event) => {
		if (event.key === 'Enter') {
			if (event.target instanceof HTMLElement && event.target.closest('[data-slot="dropdown-menu-content"]')) {
				return;
			}

			event.preventDefault();

			if (!$$props.actions?.[0]?.shortcut && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
				$$props.actions?.[0]?.handler?.();

				return;
			} else if (!$$props.actions?.[1]?.shortcut && event.ctrlKey && !event.metaKey && !event.shiftKey) {
				$$props.actions?.[1]?.handler?.();

				return;
			}
		}

		for (const action of $$props.actions ?? []) {
			if (action.shortcut && keyEventMatches(event, action.shortcut)) {
				action.handler?.();

				return;
			}
		}
	};

	var footer = root_6();

	$.event('keydown', $.document, handleKeydown);

	var node = $.child(footer);

	{
		var consequent = ($$anchor) => {
			Toast($$anchor, {
				get toast() {
					return toast();
				},

				get onToastAction() {
					return $$props.onToastAction;
				}
			});
		};

		var consequent_4 = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			{
				var consequent_1 = ($$anchor) => {
					Icon($$anchor, {
						get icon() {
							return $$props.icon;
						},
						class: 'size-5 shrink-0'
					});
				};

				$.if(node_1, ($$render) => {
					if ($$props.icon) $$render(consequent_1);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					{
						var consequent_2 = ($$anchor) => {
							var span = root();
							var text = $.only_child(span, true);

							$.template_effect(() => $.set_text(text, $$props.title));
							$.append($$anchor, span);
						};

						var alternate = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.snippet(node_4, () => $$props.title);
							$.append($$anchor, fragment_3);
						};

						$.if(node_3, ($$render) => {
							if (typeof $$props.title === 'string') $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.if(node_2, ($$render) => {
					if ($$props.title) $$render(consequent_3);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (toast()) $$render(consequent); else if ($$props.title || $$props.icon) $$render(consequent_4, 1);
		});
	}

	var div_1 = $.sibling(node, 2);
	var node_5 = $.child(div_1);

	{
		var consequent_5 = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_6 = $.first_child(fragment_4);

			$.snippet(node_6, () => $$props.primaryAction, () => ({ props: { variant: 'ghost', size: 'action' } }));
			$.append($$anchor, fragment_4);
		};

		var consequent_6 = ($$anchor) => {
			var div_2 = root_3();
			var node_7 = $.child(div_2);

			{
				let $0 = $.derived(() => $.get(primaryAction).style === 'destructive' ? 'text-destructive' : '');

				Button(node_7, {
					variant: 'ghost',
					size: 'action',
					get class() {
						return $.get($0);
					},

					get onclick() {
						return $.get(primaryAction).handler;
					},

					get disabled() {
						return $.get(primaryAction).disabled;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_5 = root_2();
						var text_1 = $.first_child(fragment_5);
						var node_8 = $.sibling(text_1);

						KeyboardShortcut(node_8, { shortcut: { modifiers: [], key: 'enter' } });
						$.template_effect(() => $.set_text(text_1, `${$.get(primaryAction).title ?? ''} `));
						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_5, ($$render) => {
			if ($$props.primaryAction) $$render(consequent_5); else if ($.get(primaryAction)) $$render(consequent_6, 1);
		});
	}

	var node_9 = $.sibling(node_5, 2);

	{
		var consequent_12 = ($$anchor) => {
			var fragment_6 = root_5();
			var div_3 = $.first_child(fragment_6);
			var node_10 = $.child(div_3);

			ActionMenu(node_10, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = $.comment();
					var node_11 = $.first_child(fragment_7);

					$.each(node_11, 17, () => $$props.actions, $.index, ($$anchor, action, i) => {
						var fragment_8 = $.comment();
						var node_12 = $.first_child(fragment_8);

						{
							let $0 = $.derived(() => $.get(action).style === 'destructive'
								? 'text-destructive focus:text-destructive-foreground focus:bg-destructive'
								: '');

							$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
								DropdownMenu_Item($$anchor, {
									get class() {
										return `rounded-md p-2 text-left ${$.get($0) ?? ''}`;
									},

									get disabled() {
										return $.get(action).disabled;
									},

									get onclick() {
										return $.get(action).handler;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root_4();
										var node_13 = $.first_child(fragment_9);

										{
											var consequent_7 = ($$anchor) => {
												Icon($$anchor, {
													get icon() {
														return $.get(action).icon;
													},
													class: 'size-4'
												});
											};

											$.if(node_13, ($$render) => {
												if ($.get(action).icon) $$render(consequent_7);
											});
										}

										var text_2 = $.sibling(node_13);
										var node_14 = $.sibling(text_2);

										{
											var consequent_8 = ($$anchor) => {
												var fragment_11 = $.comment();
												var node_15 = $.first_child(fragment_11);

												$.component(node_15, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
													DropdownMenu_Shortcut($$anchor, {
														children: ($$anchor, $$slotProps) => {
															KeyboardShortcut($$anchor, { shortcut: { key: 'enter', modifiers: [] } });
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
											};

											var consequent_9 = ($$anchor) => {
												var fragment_13 = $.comment();
												var node_16 = $.first_child(fragment_13);

												$.component(node_16, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_1) => {
													DropdownMenu_Shortcut_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															KeyboardShortcut($$anchor, { shortcut: { key: 'enter', modifiers: ['ctrl'] } });
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_13);
											};

											var consequent_10 = ($$anchor) => {
												var fragment_15 = $.comment();
												var node_17 = $.first_child(fragment_15);

												$.component(node_17, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_2) => {
													DropdownMenu_Shortcut_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															KeyboardShortcut($$anchor, {
																get shortcut() {
																	return $.get(action).shortcut;
																}
															});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_15);
											};

											$.if(node_14, ($$render) => {
												if (i == 0) $$render(consequent_8); else if (i == 1) $$render(consequent_9, 1); else if ($.get(action).shortcut) $$render(consequent_10, 2);
											});
										}

										$.template_effect(() => $.set_text(text_2, ` ${$.get(action).title ?? ''} `));
										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_8);
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);

			var node_18 = $.sibling(div_3, 2);

			{
				var consequent_11 = ($$anchor) => {
					Separator($$anchor, {
						orientation: 'vertical',
						class: 'order-2 mr-1 ml-2 !h-3 !w-[2px] transition-opacity peer-hover:opacity-0'
					});
				};

				$.if(node_18, ($$render) => {
					if ($.get(primaryAction) || $$props.primaryAction) $$render(consequent_11);
				});
			}

			$.append($$anchor, fragment_6);
		};

		$.if(node_9, ($$render) => {
			if ($$props.actions && $$props.actions.length > 1) $$render(consequent_12);
		});
	}

	$.reset(div_1);
	$.reset(footer);
	$.append($$anchor, footer);
	$.pop();
}