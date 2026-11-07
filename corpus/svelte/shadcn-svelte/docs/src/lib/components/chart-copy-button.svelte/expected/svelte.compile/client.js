import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@tabler/icons-svelte/icons/check";
import CopyIcon from "@tabler/icons-svelte/icons/copy";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'code']);
var root = $.from_html(`<span class="sr-only" data-llm-ignore="">Copy</span> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Chart_copy_button($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const clipboard = new UseClipboard();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
		Tooltip_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						{
							let $0 = $.derived(() => cn("[&_svg]-h-3.5 h-7 w-7 rounded-[6px] [&_svg]:w-3.5", $$props.class));

							Button($$anchor, $.spread_props(
								{ size: 'icon', variant: 'ghost' },
								props,
								{
									get class() {
										return $.get($0);
									},

									onclick: () => {
										clipboard.copy($$props.code);
									}
								},
								() => restProps,
								{
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
								}
							));
						}
					};

					$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
						Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
					Tooltip_Content($$anchor, {
						class: 'bg-black text-white',
						arrowClasses: 'bg-black',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Copy code');

							$.append($$anchor, text);
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