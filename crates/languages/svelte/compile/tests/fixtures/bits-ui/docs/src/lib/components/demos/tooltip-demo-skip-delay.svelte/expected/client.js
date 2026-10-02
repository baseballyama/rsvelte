import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";
import TextB from "phosphor-svelte/lib/TextB";
import TextItalic from "phosphor-svelte/lib/TextItalic";
import TextUnderline from "phosphor-svelte/lib/TextUnderline";
import TextStrikethrough from "phosphor-svelte/lib/TextStrikethrough";
import Link from "phosphor-svelte/lib/Link";
import ListBullets from "phosphor-svelte/lib/ListBullets";
import ListNumbers from "phosphor-svelte/lib/ListNumbers";
import Code from "phosphor-svelte/lib/Code";

var root = $.from_html(`<div class="bg-border mx-0.5 h-5 w-px shrink-0"></div>`);
var root_1 = $.from_html(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden flex items-center gap-2 border px-2.5 py-1.5"><span class="text-sm font-medium"> </span> <kbd class="border-dark-10 text-foreground/50 bg-background-alt rounded-[4px] border px-1.5 py-0.5 font-mono text-[11px] leading-none"> </kbd></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="rounded-10px border-border bg-background-alt shadow-mini inline-flex items-center gap-0.5 border p-1"></div>`);

export default function Tooltip_demo_skip_delay($$anchor) {
	const tools = [
		{ icon: TextB, label: "Bold", shortcut: "⌘B" },
		{ icon: TextItalic, label: "Italic", shortcut: "⌘I" },
		{ icon: TextUnderline, label: "Underline", shortcut: "⌘U" },
		{
			icon: TextStrikethrough,
			label: "Strikethrough",
			shortcut: "⌘⇧X"
		},
		{ icon: Link, label: "Link", shortcut: "⌘K" },
		{ icon: ListBullets, label: "Bullet list", shortcut: "⌘⇧8" },
		{ icon: ListNumbers, label: "Numbered list", shortcut: "⌘⇧7" },
		{ icon: Code, label: "Code", shortcut: "⌘E" }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 600,
			skipDelayDuration: 200,
			children: ($$anchor, $$slotProps) => {
				var div = root_3();

				$.each(div, 23, () => tools, (tool) => tool.label, ($$anchor, tool, i) => {
					var fragment_1 = root_2();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var div_1 = root();

							$.append($$anchor, div_1);
						};

						$.if(node_1, ($$render) => {
							if ($.get(i) === 4) $$render(consequent);
						});
					}

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_2();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
									Tooltip_Trigger($$anchor, {
										class: 'rounded-9px text-foreground/70 hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground inline-flex size-8 items-center justify-center transition-colors',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => $.get(tool).icon, ($$anchor, tool_icon) => {
												tool_icon($$anchor, { class: 'size-4', weight: 'bold' });
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_3, 2);

								$.component(node_5, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
									Tooltip_Portal($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_6 = $.first_child(fragment_4);

											$.component(node_6, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
												Tooltip_Content($$anchor, {
													sideOffset: 8,
													class: 'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-tooltip-content-transform-origin)',
													children: ($$anchor, $$slotProps) => {
														var div_2 = root_1();
														var span = $.child(div_2);
														var text = $.only_child(span, true);
														var kbd = $.sibling(span, 2);
														var text_1 = $.only_child(kbd, true);

														$.reset(div_2);

														$.template_effect(() => {
															$.set_text(text, $.get(tool).label);
															$.set_text(text_1, $.get(tool).shortcut);
														});

														$.append($$anchor, div_2);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				});

				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}