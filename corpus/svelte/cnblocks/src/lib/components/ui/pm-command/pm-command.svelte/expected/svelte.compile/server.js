import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { resolveCommand } from "package-manager-detector/commands";
import CopyButton from "../copy-button/copy-button.svelte";
import ClipboardIcon from "@lucide/svelte/icons/clipboard";
import TerminalIcon from "@lucide/svelte/icons/terminal";
import * as Tooltip from "$lib/components/ui/tooltip";
import * as Tabs from "$lib/components/ui/tabs";
import { tv } from "tailwind-variants";

const style = tv({
	base: "w-full rounded-lg border border-border",
	variants: {
		variant: {
			default: "bg-card",
			secondary: "border-transparent bg-secondary/50"
		}
	}
});

export default function Pm_command($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			variant = "default",
			class: className,
			command,
			agents = ["npm", "pnpm", "yarn", "bun"],
			args,
			agent = "pnpm"
		} = $$props;

		const cmd = $.derived(() => resolveCommand(agent, command, args));
		const commandText = $.derived(() => `${cmd()?.command} ${cmd()?.args.join(" ")}`);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(cn(style({ variant }), className)), 'svelte-1l21zmq')}><div class="flex place-items-center justify-between gap-2 border-b border-border py-1 pr-2"><div class="flex place-items-center gap-2 px-2"><div class="flex size-4 place-items-center justify-center bg-foreground opacity-50">`);
			TerminalIcon($$renderer, { class: 'size-3 text-background' });
			$$renderer.push(`<!----></div> `);

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					get value() {
						return agent;
					},

					set value($$value) {
						agent = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'h-auto bg-transparent p-0',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(agents);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let pm = each_array[$$index];

										if (Tabs.Trigger) {
											$$renderer.push('<!--[-->');

											Tabs.Trigger($$renderer, {
												value: pm,
												class: 'h-7 font-mono text-sm font-light',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(pm)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> `);

			if (Tooltip.Provider) {
				$$renderer.push('<!--[-->');

				Tooltip.Provider($$renderer, {
					delayDuration: 0,
					children: ($$renderer) => {
						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');

							Tooltip.Root($$renderer, {
								children: ($$renderer) => {
									{
										function child($$renderer, { props }) {
											{
												function icon($$renderer) {
													ClipboardIcon($$renderer, {});
												}

												CopyButton($$renderer, $.spread_props([
													props,
													{
														text: commandText(),
														class: 'size-6 [&_svg]:size-3',
														icon,
														$$slots: { icon: true }
													}
												]));
											}
										}

										if (Tooltip.Trigger) {
											$$renderer.push('<!--[-->');
											Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(` `);

									if (Tooltip.Content) {
										$$renderer.push('<!--[-->');

										Tooltip.Content($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Copy to Clipboard`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div class="no-scrollbar overflow-x-auto p-3 svelte-1l21zmq"><span class="font-mono text-sm leading-none font-light text-nowrap text-muted-foreground">${$.escape(commandText())}</span></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { agent });
	});
}