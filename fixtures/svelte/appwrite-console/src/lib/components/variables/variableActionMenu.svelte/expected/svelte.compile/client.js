import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { computePosition, flip, offset, shift, autoUpdate } from '@floating-ui/dom';
import { Icon, ActionMenu } from '@appwrite.io/pink-svelte';
import { IconDotsHorizontal, IconPencil, IconEyeOff, IconTrash } from '@appwrite.io/pink-icons-svelte';
import { Button as PinkButton } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div style="position: fixed; z-index: 9001; background: var(--bgcolor-neutral-primary); border: var(--border-width-s) solid var(--border-neutral); border-radius: var(--border-radius-m); box-shadow: 0 1px 3px 0 rgba(0,0,0,0.03), 0 4px 4px 0 rgba(0,0,0,0.04); overflow: hidden;" role="menu"><!></div>`);
var root_2 = $.from_html(`<span><!></span> <!>`, 1);

export default function VariableActionMenu($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let triggerEl = $.state(null);
	let menuEl = $.state(null);
	let cleanup = null;

	function hide() {
		$.set(open, false);
	}

	function toggle() {
		$.set(open, !$.get(open));
	}

	function portalToBody(node) {
		document.body.appendChild(node);

		return {
			destroy() {
				node.parentNode?.removeChild(node);
			}
		};
	}

	$.user_effect(() => {
		if ($.get(open) && $.get(triggerEl) && $.get(menuEl)) {
			cleanup = autoUpdate($.get(triggerEl), $.get(menuEl), () => {
				computePosition($.get(triggerEl), $.get(menuEl), {
					placement: 'bottom-end',
					middleware: [offset(2), flip(), shift()]
				}).then(({ x, y }) => {
					if ($.get(menuEl)) {
						Object.assign($.get(menuEl).style, { left: `${x}px`, top: `${y}px` });
					}
				});
			});
		} else {
			cleanup?.();
			cleanup = null;
		}
	});

	function handleWindowClick(e) {
		if (!$.get(open)) return;

		const target = e.target;

		if ($.get(triggerEl)?.contains(target) || $.get(menuEl)?.contains(target)) return;

		hide();
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') hide();
	}

	var fragment = root_2();

	$.event('click', $.window, handleWindowClick);
	$.event('keydown', $.window, handleKeydown);

	var span = $.first_child(fragment);
	var node_1 = $.child(span);

	$.component(node_1, () => PinkButton.Button, ($$anchor, PinkButton_Button) => {
		PinkButton_Button($$anchor, {
			icon: true,
			variant: 'text',
			size: 's',
			'aria-label': 'More options',
			onclick: (e) => {
				e.preventDefault();
				toggle();
			},

			children: ($$anchor, $$slotProps) => {
				Icon($$anchor, {
					get icon() {
						return IconDotsHorizontal;
					},
					size: 's'
				});
			},
			$$slots: { default: true }
		});
	});

	$.reset(span);
	$.bind_this(span, ($$value) => $.set(triggerEl, $$value), () => $.get(triggerEl));

	var node_2 = $.sibling(span, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_1();
			var node_3 = $.child(div);

			$.component(node_3, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
				ActionMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_4 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_5 = $.first_child(fragment_3);

								$.component(node_5, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
									ActionMenu_Item_Button($$anchor, {
										get leadingIcon() {
											return IconPencil;
										},

										$$events: {
											click: () => {
												hide();
												$$props.onUpdate();
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Update');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							};

							$.if(node_4, ($$render) => {
								if (!$$props.variable?.secret) $$render(consequent);
							});
						}

						var node_6 = $.sibling(node_4, 2);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_7 = $.first_child(fragment_4);

								$.component(node_7, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_1) => {
									ActionMenu_Item_Button_1($$anchor, {
										get leadingIcon() {
											return IconEyeOff;
										},

										$$events: {
											click: () => {
												hide();
												$$props.onSecret();
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Secret');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							};

							$.if(node_6, ($$render) => {
								if (!$$props.variable?.secret) $$render(consequent_1);
							});
						}

						var node_8 = $.sibling(node_6, 2);

						$.component(node_8, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_2) => {
							ActionMenu_Item_Button_2($$anchor, {
								status: 'danger',
								get leadingIcon() {
									return IconTrash;
								},

								$$events: {
									click: () => {
										hide();
										$$props.onDelete();
									}
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Delete');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.action(div, ($$node) => portalToBody?.($$node));
			$.bind_this(div, ($$value) => $.set(menuEl, $$value), () => $.get(menuEl));
			$.append($$anchor, div);
		};

		$.if(node_2, ($$render) => {
			if ($.get(open)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}