import * as $ from 'svelte/internal/server';
import BookOpenIcon from "@lucide/svelte/icons/book-open";
import CheckIcon from "@lucide/svelte/icons/check";
import CopyIcon from "@lucide/svelte/icons/copy";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import Callout from "$lib/components/callout.svelte";
import PMExecute from "$lib/components/pm-execute.svelte";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { getCommand } from "$lib/package-manager.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";
import { InitializeProjectContext, InitializeProjectCtx } from "./initialize-project-context.svelte.js";

export default function Initialize_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const initializeProjectCtx = InitializeProjectCtx.set(new InitializeProjectContext());
		const designSystem = useDesignSystem();
		const userConfig = UserConfigContext.get();
		const clipboard = new UseClipboard();
		const command = $.derived(() => `shadcn-svelte init --preset ${designSystem.preset}`);

		function commandTextForPm(agent) {
			const resolved = getCommand(agent, "execute", command());

			return `${resolved.command} ${resolved.args.join(" ")}`.trim();
		}

		const fullCommand = $.derived(() => commandTextForPm(userConfig.current.packageManager));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return initializeProjectCtx.open;
					},

					set open($$value) {
						initializeProjectCtx.open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'w-full max-w-lg!',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Initialize Project`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Run the following command to initialize your project with the current preset.`);
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

									$$renderer.push(` `);

									Callout($$renderer, {
										class: '-mb-6 w-full md:mx-0',
										icon: BookOpenIcon,
										title: 'Set up your project first',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Refer to the <a href="/docs/installation" class="font-medium underline underline-offset-4 hover:text-primary">installation docs</a> for framework setup before initializing shadcn-svelte with the command below.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (Tooltip.Provider) {
										$$renderer.push('<!--[-->');

										Tooltip.Provider($$renderer, {
											children: ($$renderer) => {
												PMExecute($$renderer, { command: command() });
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'default',
													class: 'w-full',
													onclick: () => clipboard.copy(fullCommand()),
													children: ($$renderer) => {
														if (clipboard.copied) {
															$$renderer.push('<!--[0-->');
															CheckIcon($$renderer, {});
														} else {
															$$renderer.push('<!--[-1-->');
															CopyIcon($$renderer, {});
														}

														$$renderer.push(`<!--]--> Copy Command`);
													},
													$$slots: { default: true }
												});
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

			$$renderer.push(` `);
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}