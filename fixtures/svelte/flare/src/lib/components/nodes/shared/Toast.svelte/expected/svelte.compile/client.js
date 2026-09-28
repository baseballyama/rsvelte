import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import KeyboardShortcut from '$lib/components/KeyboardShortcut.svelte';
import { keyEventMatches } from '$lib/props/actions';
import { focusManager } from '$lib/focus.svelte';

var root = $.from_html(`<div class="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>`);
var root_1 = $.from_html(`<div class="shadow-glow size-2 rounded-full bg-green-500 shadow-green-500"></div>`);
var root_2 = $.from_html(`<div class="shadow-glow size-2 rounded-full bg-red-500 shadow-red-500"></div>`);
var root_3 = $.from_html(`<div><div class="flex size-4 items-center justify-center"><!></div> <div><span> </span> <span class="text-muted-foreground text-sm"> </span></div> <!></div>`);
var root_4 = $.from_html(` <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function Toast($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	const scopeId = `toast-menu-${crypto.randomUUID()}`;

	$.user_effect(() => {
		if ($.get(open)) {
			focusManager.requestFocus(scopeId);
		} else {
			focusManager.releaseFocus(scopeId);
		}
	});

	const actions = $.derived(() => {
		if (!$$props.toast) return [];

		const availableActions = [];

		if ($$props.toast.primaryAction) {
			availableActions.push({ type: 'primary', ...$$props.toast.primaryAction });
		}

		if ($$props.toast.secondaryAction) {
			availableActions.push({ type: 'secondary', ...$$props.toast.secondaryAction });
		}

		return availableActions;
	});

	const handleKeydown = (e) => {
		if (e.key.toLowerCase() === 't' && (e.ctrlKey || e.metaKey)) {
			if ($.get(actions).length > 0) {
				e.preventDefault();
				$.set(open, !$.get(open));
			}
		} else if ($$props.toast?.primaryAction?.shortcut && keyEventMatches(e, $$props.toast.primaryAction.shortcut)) {
			handleActionSelect('primary');
		} else if ($$props.toast?.secondaryAction?.shortcut && keyEventMatches(e, $$props.toast.secondaryAction.shortcut)) {
			handleActionSelect('secondary');
		}
	};

	const handleActionSelect = (actionType) => {
		if ($$props.onToastAction) {
			$$props.onToastAction($$props.toast.id, actionType);
		}

		$.set(open, false);
	};

	var fragment = $.comment();

	$.event('keydown', $.window, handleKeydown);

	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_6();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var div = root_3();

						$.attribute_effect(div, () => ({ ...props(), class: 'flex items-baseline gap-2' }));

						var div_1 = $.child(div);
						var node_2 = $.child(div_1);

						{
							var consequent = ($$anchor) => {
								var div_2 = root();

								$.append($$anchor, div_2);
							};

							var consequent_1 = ($$anchor) => {
								var div_3 = root_1();

								$.append($$anchor, div_3);
							};

							var consequent_2 = ($$anchor) => {
								var div_4 = root_2();

								$.append($$anchor, div_4);
							};

							$.if(node_2, ($$render) => {
								if ($$props.toast.style === 'ANIMATED') $$render(consequent); else if ($$props.toast.style === 'SUCCESS') $$render(consequent_1, 1); else if ($$props.toast.style === 'FAILURE') $$render(consequent_2, 2);
							});
						}

						$.reset(div_1);

						var div_5 = $.sibling(div_1, 2);
						var span = $.child(div_5);
						var text = $.only_child(span, true);
						var span_1 = $.sibling(span, 2);
						var text_1 = $.only_child(span_1, true);

						$.reset(div_5);

						var node_3 = $.sibling(div_5, 2);

						{
							var consequent_3 = ($$anchor) => {
								KeyboardShortcut($$anchor, { shortcut: { key: 't', modifiers: ['ctrl'] } });
							};

							$.if(node_3, ($$render) => {
								if ($$props.toast.primaryAction || $$props.toast.secondaryAction) $$render(consequent_3);
							});
						}

						$.reset(div);

						$.template_effect(() => {
							$.set_text(text, $$props.toast.title);
							$.set_text(text_1, $$props.toast.message);
						});

						$.append($$anchor, div);
					};

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						side: 'top',
						align: 'start',
						class: 'w-60',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_5();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
								DropdownMenu_Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Toast Actions');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
								DropdownMenu_Separator($$anchor, {});
							});

							var node_7 = $.sibling(node_6, 2);

							$.each(node_7, 17, () => $.get(actions), (action) => action.type, ($$anchor, action) => {
								var fragment_4 = $.comment();
								var node_8 = $.first_child(fragment_4);

								$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
									DropdownMenu_Item($$anchor, {
										onclick: () => handleActionSelect($.get(action).type),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_5 = root_4();
											var text_3 = $.first_child(fragment_5);
											var node_9 = $.sibling(text_3);

											{
												var consequent_4 = ($$anchor) => {
													var fragment_6 = $.comment();
													var node_10 = $.first_child(fragment_6);

													$.component(node_10, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
														DropdownMenu_Shortcut($$anchor, {
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

													$.append($$anchor, fragment_6);
												};

												$.if(node_9, ($$render) => {
													if ($.get(action).shortcut) $$render(consequent_4);
												});
											}

											$.template_effect(() => $.set_text(text_3, `${$.get(action).title ?? ''} `));
											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}