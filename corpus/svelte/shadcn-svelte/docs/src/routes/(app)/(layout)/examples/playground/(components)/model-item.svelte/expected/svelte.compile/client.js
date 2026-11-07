import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import * as Command from "$lib/registry/ui/command/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'model',
	'isSelected',
	'onSelect',
	'onPeek'
]);

var root = $.from_html(`<div> <!></div>`);

export default function Model_item($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	function mutationObserverAction(node) {
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type !== "attributes" || mutation.attributeName !== "aria-selected") continue;

				if (node.getAttribute("aria-selected") === "true") {
					$$props.onPeek($$props.model);
				}
			}
		});

		observer.observe(node, { attributes: true });

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		const child = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;
			var div = root();

			$.attribute_effect(div, () => ({
				...props(),
				class: 'relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none aria-selected:bg-primary aria-selected:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
			}));

			var text = $.child(div);
			var node_2 = $.sibling(text);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => cn("ms-auto size-4"));

						CheckIcon($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node_2, ($$render) => {
					if ($$props.isSelected) $$render(consequent);
				});
			}

			$.reset(div);
			$.action(div, ($$node) => mutationObserverAction?.($$node));
			$.template_effect(() => $.set_text(text, `${$$props.model.name ?? ''} `));
			$.append($$anchor, div);
		};

		$.component(node_1, () => Command.Item, ($$anchor, Command_Item) => {
			Command_Item($$anchor, $.spread_props(
				{
					get value() {
						return $$props.model.name;
					},

					get onSelect() {
						return $$props.onSelect;
					}
				},
				() => restProps,
				{ child, $$slots: { child: true } }
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}