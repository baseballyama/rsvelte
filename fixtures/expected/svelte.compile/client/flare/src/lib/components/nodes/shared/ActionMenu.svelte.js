import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { Button } from '$lib/components/ui/button';
import KeyboardShortcut from '$lib/components/KeyboardShortcut.svelte';
import { focusManager } from '$lib/focus.svelte';

var root = $.from_html(`Actions <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ActionMenu($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	const scopeId = `action-menu-${crypto.randomUUID()}`;

	$.user_effect(() => {
		if ($.get(open)) {
			focusManager.requestFocus(scopeId);
		} else {
			focusManager.releaseFocus(scopeId);
		}
	});

	function handleKeydown(e) {
		if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			$.set(open, !$.get(open));
		}
	}

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
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'ghost',
							size: 'action',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_3 = root();
								var node_2 = $.sibling($.first_child(fragment_3));

								KeyboardShortcut(node_2, { shortcut: { key: 'k', modifiers: ['cmd'] } });
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							'data-testid': 'action-menu-trigger',
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						class: 'w-80',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.snippet(node_4, () => $$props.children);
							$.append($$anchor, fragment_4);
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