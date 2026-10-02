import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`Refer to the <a href="/docs/installation" class="font-medium underline underline-offset-4 hover:text-primary">installation docs</a> for framework setup before initializing shadcn-svelte with the command below.`, 1);
var root_2 = $.from_html(`<!> Copy Command`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Initialize_dialog($$anchor, $$props) {
	$.push($$props, true);

	const initializeProjectCtx = InitializeProjectCtx.set(new InitializeProjectContext());
	const designSystem = useDesignSystem();
	const userConfig = UserConfigContext.get();
	const clipboard = new UseClipboard();
	const command = $.derived(() => `shadcn-svelte init --preset ${designSystem.preset}`);

	function commandTextForPm(agent) {
		const resolved = getCommand(agent, "execute", $.get(command));

		return `${resolved.command} ${resolved.args.join(" ")}`.trim();
	}

	const fullCommand = $.derived(() => commandTextForPm(userConfig.current.packageManager));
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return initializeProjectCtx.open;
			},

			set open($$value) {
				initializeProjectCtx.open = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'w-full max-w-lg!',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Initialize Project');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Run the following command to initialize your project with the current preset.');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_2, 2);

							Callout(node_5, {
								class: '-mb-6 w-full md:mx-0',
								get icon() {
									return BookOpenIcon;
								},
								title: 'Set up your project first',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_4 = root_1();

									$.next(2);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
								Tooltip_Provider($$anchor, {
									children: ($$anchor, $$slotProps) => {
										PMExecute($$anchor, {
											get command() {
												return $.get(command);
											}
										});
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'default',
											class: 'w-full',
											onclick: () => clipboard.copy($.get(fullCommand)),
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_2();
												var node_8 = $.first_child(fragment_7);

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

												$.next();
												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
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
			},
			$$slots: { default: true }
		});
	});

	var node_9 = $.sibling(node, 2);

	$.snippet(node_9, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}