import * as $ from 'svelte/internal/server';
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

export default function Pm_block($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { type, command } = $$props;
		const userConfig = UserConfigContext.get();

		function getCommandText(agent) {
			const cmd = getCommand(agent, type, command);

			return `${cmd.command} ${cmd.args.join(" ")}`.trim();
		}

		const commandText = $.derived(() => getCommandText(userConfig.current.packageManager));
		const clipboard = new UseClipboard();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			var bind_get = () => userConfig.current.packageManager;

			var bind_set = (v) => {
				userConfig.setConfig({ packageManager: v });
			};

			$$renderer.push(`<figure data-rehype-pretty-code-figure=""><div class="overflow-x-auto">`);

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					get value() {
						return bind_get();
					},

					set value($$value) {
						bind_set($$value);
					},
					class: 'gap-0',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex items-center gap-2 border-b border-border/50 px-3 py-1"><div class="flex size-4 items-center justify-center rounded-[1px] bg-foreground opacity-70">`);
						TerminalIcon($$renderer, { class: 'size-3 text-code' });
						$$renderer.push(`<!----></div> `);

						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'rounded-none bg-transparent p-0',
								'data-llm-ignore': true,
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(PACKAGE_MANAGERS);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let pm = each_array[$$index];

										if (Tabs.Trigger) {
											$$renderer.push('<!--[-->');

											Tabs.Trigger($$renderer, {
												value: pm,
												class: '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4 inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 pt-0.5 font-mono text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-input data-[state=active]:bg-accent data-[state=active]:shadow-none dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground',
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

						$$renderer.push(`</div> <div class="no-scrollbar overflow-x-auto"><!--[-->`);

						const each_array_1 = $.ensure_array_like(PACKAGE_MANAGERS);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let pm = each_array_1[$$index_1];

							{
								function child($$renderer, { props }) {
									const { hidden, class: className, ...rest } = props;

									$$renderer.push(`<div${$.attributes({ ...rest, class: $.clsx(cn(className, hidden && "hidden")) })}><pre><code class="font-mono text-sm leading-none" data-language="bash">${$.escape(getCommandText(pm))}</code></pre></div>`);
								}

								if (Tabs.Content) {
									$$renderer.push('<!--[-->');

									Tabs.Content($$renderer, {
										value: pm,
										class: 'mt-0 px-4 py-3.5',
										'data-llm-ignore': pm === "yarn" || pm === "yarn@berry" ? "" : undefined,
										child,
										$$slots: { child: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Tooltip.Root) {
				$$renderer.push('<!--[-->');

				Tooltip.Root($$renderer, {
					disableCloseOnTriggerClick: true,
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										'data-slot': 'copy-button',
										size: 'icon',
										variant: 'ghost',
										class: 'absolute end-2 top-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100',
										children: ($$renderer) => {
											$$renderer.push(`<span class="sr-only" data-llm-ignore="">Copy</span> `);

											if (clipboard.copied) {
												$$renderer.push('<!--[0-->');
												CheckIcon($$renderer, {});
											} else {
												$$renderer.push('<!--[-1-->');
												CopyIcon($$renderer, {});
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Tooltip.Trigger) {
								$$renderer.push('<!--[-->');

								Tooltip.Trigger($$renderer, {
									onclick: () => clipboard.copy(commandText()),
									child,
									$$slots: { child: true }
								});

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
									$$renderer.push(`<!---->${$.escape(clipboard.copied ? "Copied" : "Copy to Clipboard")}`);
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

			$$renderer.push(`</div></figure>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}