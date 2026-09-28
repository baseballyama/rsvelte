import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { resolveCommand } from 'package-manager-detector/commands';
import CopyButton from '$lib/components/ui/copy-button/copy-button.svelte';
import ClipboardIcon from '@lucide/svelte/icons/clipboard';
import TerminalIcon from '@lucide/svelte/icons/terminal';
import * as Tooltip from '$lib/components/ui/tooltip';
import { PersistedState } from 'runed';
import * as Tabs from '$lib/components/ui/tabs';
import { tv } from 'tailwind-variants';

const style = tv({
	base: 'border-border w-full rounded-lg border',
	variants: {
		variant: {
			default: 'bg-card',
			secondary: 'bg-secondary/50 border-transparent'
		}
	}
});

export default function Jsrepo_command($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { variant = 'default', class: className, command, args } = $$props;

		if (args[0] !== 'jsrepo') {
			throw new Error("jsrepo command's first arg must be jsrepo");
		}

		const agents = ['jsrepo', 'pnpm', 'npm', 'bun', 'yarn'];
		const agent = new PersistedState('user-package-manager-jsrepo-command', 'jsrepo');

		const cmd = $.derived(() => {
			if (agent.current === 'jsrepo') {
				return {
					command: 'jsrepo',
					args: args.slice(1) // remove the first argument (jsrepo)
				};
			}

			return resolveCommand(agent.current, command, args);
		});

		const commandText = $.derived(() => `${cmd()?.command} ${cmd()?.args.join(' ')}`);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div data-slot="jsrepo-command"${$.attr_class($.clsx(cn(style({ variant }), className)))}><div class="border-border flex place-items-center justify-between gap-2 border-b py-1 pr-2"><div class="flex place-items-center gap-2 px-2"><div class="bg-foreground flex size-4 place-items-center justify-center opacity-50">`);
			TerminalIcon($$renderer, { class: 'text-background size-3' });
			$$renderer.push(`<!----></div> `);

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					get value() {
						return agent.current;
					},

					set value($$value) {
						agent.current = $$value;
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
											tabindex: -1,
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

			$$renderer.push(`</div> <div class="no-scrollbar overflow-x-auto p-3"><span class="text-muted-foreground font-mono text-sm leading-none font-light text-nowrap">${$.escape(commandText())}</span></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}