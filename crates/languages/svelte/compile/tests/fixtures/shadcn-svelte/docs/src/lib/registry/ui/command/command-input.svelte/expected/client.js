import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command as CommandPrimitive } from "bits-ui";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'value']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div data-slot="command-input-wrapper" class="cn-command-input-wrapper"><!></div>`);

export default function Command_input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root_1();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			class: 'cn-command-input-group',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
							InputGroup_Input($$anchor, $.spread_props(props, {
								get value() {
									return value();
								},

								set value($$value) {
									value($$value);
								},

								get ref() {
									return ref();
								},

								set ref($$value) {
									ref($$value);
								}
							}));
						});

						$.append($$anchor, fragment_1);
					};

					let $0 = $.derived(() => cn("cn-command-input outline-hidden disabled:cursor-not-allowed disabled:opacity-50", $$props.class));

					$.component(node_1, () => CommandPrimitive.Input, ($$anchor, CommandPrimitive_Input) => {
						CommandPrimitive_Input($$anchor, $.spread_props(
							{
								get value() {
									return value();
								},
								'data-slot': 'command-input',
								get class() {
									return $.get($0);
								}
							},
							() => restProps,
							{ child, $$slots: { child: true } }
						));
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							IconPlaceholder($$anchor, {
								lucide: 'SearchIcon',
								tabler: 'IconSearch',
								hugeicons: 'SearchIcon',
								phosphor: 'MagnifyingGlassIcon',
								remixicon: 'RiSearchLine',
								class: 'cn-command-input-icon'
							});
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