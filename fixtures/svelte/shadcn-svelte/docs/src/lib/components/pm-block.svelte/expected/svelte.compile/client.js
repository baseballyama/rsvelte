import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TerminalIcon from "@lucide/svelte/icons/terminal";
import CheckIcon from "@tabler/icons-svelte/icons/check";
import CopyIcon from "@tabler/icons-svelte/icons/copy";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { getCommand, PACKAGE_MANAGERS } from "$lib/package-manager.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<div><pre><code class="font-mono text-sm leading-none" data-language="bash"> </code></pre></div>`);
var root_1 = $.from_html(`<div class="flex items-center gap-2 border-b border-border/50 px-3 py-1"><div class="flex size-4 items-center justify-center rounded-[1px] bg-foreground opacity-70"><!></div> <!></div> <div class="no-scrollbar overflow-x-auto"></div>`, 1);
var root_2 = $.from_html(`<span class="sr-only" data-llm-ignore="">Copy</span> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<figure data-rehype-pretty-code-figure=""><div class="overflow-x-auto"><!> <!></div></figure>`);

export default function Pm_block($$anchor, $$props) {
	$.push($$props, true);

	const userConfig = UserConfigContext.get();

	function getCommandText(agent) {
		const cmd = getCommand(agent, $$props.type, $$props.command);

		return `${cmd.command} ${cmd.args.join(" ")}`.trim();
	}

	const commandText = $.derived(() => getCommandText(userConfig.current.packageManager));
	const clipboard = new UseClipboard();
	var figure = root_4();
	var div = $.child(figure);
	var node = $.child(div);
	var bind_get = () => userConfig.current.packageManager;

	var bind_set = (v) => {
		userConfig.setConfig({ packageManager: v });
	};

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			get value() {
				return bind_get();
			},

			set value($$value) {
				bind_set($$value);
			},
			class: 'gap-0',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var div_1 = $.first_child(fragment);
				var div_2 = $.child(div_1);
				var node_1 = $.child(div_2);

				TerminalIcon(node_1, { class: 'size-3 text-code' });
				$.reset(div_2);

				var node_2 = $.sibling(div_2, 2);

				$.component(node_2, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'rounded-none bg-transparent p-0',
						'data-llm-ignore': true,
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.each(node_3, 16, () => PACKAGE_MANAGERS, (pm) => pm, ($$anchor, pm) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
									Tabs_Trigger($$anchor, {
										get value() {
											return pm;
										},
										class: '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4 inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 pt-0.5 font-mono text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-input data-[state=active]:bg-accent data-[state=active]:shadow-none dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, pm));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_3 = $.sibling(div_1, 2);

				$.each(div_3, 20, () => PACKAGE_MANAGERS, (pm) => pm, ($$anchor, pm) => {
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							const computed_const = $.derived(() => {
								const { hidden, class: className, ...rest } = props();

								return { hidden, className, rest };
							});

							var div_4 = root();

							$.attribute_effect(div_4, ($0) => ({ ...$.get(computed_const).rest, class: $0 }), [
								() => cn($.get(computed_const).className, $.get(computed_const).hidden && "hidden")
							]);

							var pre = $.child(div_4);
							var code = $.child(pre);
							var text_1 = $.only_child(code, true);

							$.reset(pre);
							$.reset(div_4);
							$.template_effect(($0) => $.set_text(text_1, $0), [() => getCommandText(pm)]);
							$.append($$anchor, div_4);
						};

						let $0 = $.derived(() => pm === "yarn" || pm === "yarn@berry" ? "" : undefined);

						$.component(node_5, () => Tabs.Content, ($$anchor, Tabs_Content) => {
							Tabs_Content($$anchor, {
								get value() {
									return pm;
								},
								class: 'mt-0 px-4 py-3.5',
								get 'data-llm-ignore'() {
									return $.get($0);
								},
								child,
								$$slots: { child: true }
							});
						});
					}

					$.append($$anchor, fragment_4);
				});

				$.reset(div_3);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node, 2);

	$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
		Tooltip_Root($$anchor, {
			disableCloseOnTriggerClick: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_3();
				var node_7 = $.first_child(fragment_5);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							'data-slot': 'copy-button',
							size: 'icon',
							variant: 'ghost',
							class: 'absolute end-2 top-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100',
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root_2();
								var node_8 = $.sibling($.first_child(fragment_7), 2);

								{
									var consequent = ($$anchor) => {
										CheckIcon($$anchor, {});
									};

									var alternate = ($$anchor) => {
										CopyIcon($$anchor, {});
									};

									$.if(node_8, ($$render) => {
										if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_7, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
						Tooltip_Trigger($$anchor, {
							onclick: () => clipboard.copy($.get(commandText)),
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_9 = $.sibling(node_7, 2);

				$.component(node_9, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
					Tooltip_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, clipboard.copied ? "Copied" : "Copy to Clipboard"));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.reset(figure);
	$.append($$anchor, figure);
	$.pop();
}