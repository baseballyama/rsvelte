import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";
import Label from "$lib/registry/ui/label/label.svelte";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { THEMES } from "$lib/registry/themes.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<span class="font-medium">Theme:</span> <span class="w-12"> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <!></div>`);

export default function Theme_selector($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const designSystem = useDesignSystem();
	const themesList = $.derived(() => THEMES.map((theme) => ({ name: theme.title, value: theme.name })).sort((a, b) => a.name.localeCompare(b.name)));
	const label = $.derived(() => $.get(themesList).find((t) => t.value === designSystem.theme)?.name ?? "Neutral");
	var div = root_2();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn("flex items-center gap-2", $$props.class)]);

	var node = $.child(div);

	Label(node, {
		for: 'theme-selector',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Theme');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return designSystem.theme;
			},

			set value($$value) {
				designSystem.theme = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						size: 'sm',
						class: 'justify-start border-secondary bg-secondary text-secondary-foreground shadow-none',
						id: 'theme-selector',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var span = $.sibling($.first_child(fragment_1), 2);
							var text_1 = $.only_child(span, true);

							$.template_effect(() => $.set_text(text_1, $.get(label)));
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						align: 'end',
						class: 'max-h-80',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => Select.Group, ($$anchor, Select_Group) => {
								Select_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										$.each(node_5, 17, () => $.get(themesList), (theme) => theme.value, ($$anchor, theme) => {
											var fragment_4 = $.comment();
											var node_6 = $.first_child(fragment_4);

											$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
												Select_Item($$anchor, {
													get value() {
														return $.get(theme).value;
													},

													get label() {
														return $.get(theme).name;
													},
													class: 'data-[selected]:opacity-50',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text();

														$.template_effect(() => $.set_text(text_2, $.get(theme).name));
														$.append($$anchor, text_2);
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

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}