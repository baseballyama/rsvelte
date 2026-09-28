import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import CopyIcon from "@tabler/icons-svelte/icons/copy";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'text',
	'variant',
	'class'
]);

var root = $.from_html(`<span class="sr-only" data-llm-ignore="">Copy</span> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Copy_button($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, "ghost"),
		restProps = $.rest_props($$props, rest_excludes);

	const clipboard = new UseClipboard();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const rp = $.derived(() => restProps);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
		Tooltip_Root($$anchor, {
			disableCloseOnTriggerClick: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							'data-slot': 'copy-button',
							size: 'icon',
							get variant() {
								return variant();
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.sibling($.first_child(fragment_3), 2);

								{
									var consequent = ($$anchor) => {
										CheckIcon($$anchor, {});
									};

									var alternate = ($$anchor) => {
										CopyIcon($$anchor, {});
									};

									$.if(node_2, ($$render) => {
										if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					};

					let $0 = $.derived(() => cn("absolute end-2 top-3 z-10 size-7 bg-code hover:opacity-100 focus-visible:opacity-100", $$props.class));

					$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
						Tooltip_Trigger($$anchor, $.spread_props(() => $.get(rp), {
							get class() {
								return $.get($0);
							},
							onclick: () => clipboard.copy($$props.text),
							child,
							$$slots: { child: true }
						}));
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
					Tooltip_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, clipboard.copied ? "Copied" : "Copy to Clipboard"));
							$.append($$anchor, text_1);
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