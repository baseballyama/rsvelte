import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { resolveCommand } from 'package-manager-detector/commands';
import CopyButton from '$lib/components/ui/copy-button/copy-button.svelte';
import ClipboardIcon from '@lucide/svelte/icons/clipboard';
import TerminalIcon from '@lucide/svelte/icons/terminal';
import * as Tooltip from '$lib/components/ui/tooltip';
import { PersistedState } from 'runed';
import * as Tabs from '$lib/components/ui/tabs';

const style = tv({
	base: 'border-border w-full rounded-lg border',
	variants: {
		variant: {
			default: 'bg-card',
			secondary: 'bg-secondary/50 border-transparent'
		}
	}
});

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div data-slot="jsrepo-command"><div class="border-border flex place-items-center justify-between gap-2 border-b py-1 pr-2"><div class="flex place-items-center gap-2 px-2"><div class="bg-foreground flex size-4 place-items-center justify-center opacity-50"><!></div> <!></div> <!></div> <div class="no-scrollbar overflow-x-auto p-3"><span class="text-muted-foreground font-mono text-sm leading-none font-light text-nowrap"> </span></div></div>`);

export default function Jsrepo_command($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, 'default');

	if ($$props.args[0] !== 'jsrepo') {
		throw new Error("jsrepo command's first arg must be jsrepo");
	}

	const agents = ['jsrepo', 'pnpm', 'npm', 'bun', 'yarn'];
	const agent = new PersistedState('user-package-manager-jsrepo-command', 'jsrepo');

	const cmd = $.derived(() => {
		if (agent.current === 'jsrepo') {
			return {
				command: 'jsrepo',
				args: $$props.args.slice(1) // remove the first argument (jsrepo)
			};
		}

		return resolveCommand(agent.current, $$props.command, $$props.args);
	});

	const commandText = $.derived(() => `${$.get(cmd)?.command} ${$.get(cmd)?.args.join(' ')}`);
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	TerminalIcon(node, { class: 'text-background size-3' });
	$.reset(div_3);

	var node_1 = $.sibling(div_3, 2);

	$.component(node_1, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			get value() {
				return agent.current;
			},

			set value($$value) {
				agent.current = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'h-auto bg-transparent p-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.each(node_3, 16, () => agents, (pm) => pm, ($$anchor, pm) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
									Tabs_Trigger($$anchor, {
										get value() {
											return pm;
										},
										class: 'h-7 font-mono text-sm font-light',
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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);

	var node_5 = $.sibling(div_2, 2);

	$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
		Tooltip_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_6 = $.first_child(fragment_4);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						{
							const icon = ($$anchor) => {
								ClipboardIcon($$anchor, {});
							};

							CopyButton($$anchor, $.spread_props(props, {
								get text() {
									return $.get(commandText);
								},
								tabindex: -1,
								class: 'size-6 [&_svg]:size-3',
								icon,
								$$slots: { icon: true }
							}));
						}
					};

					$.component(node_6, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
						Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
					Tooltip_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Copy to Clipboard');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var span = $.child(div_4);
	var text_2 = $.only_child(span, true);

	$.reset(div_4);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			$.set_text(text_2, $.get(commandText));
		},
		[
			() => $.clsx(cn(style({ variant: variant() }), $$props.class))
		]
	);

	$.append($$anchor, div);
	$.pop();
}