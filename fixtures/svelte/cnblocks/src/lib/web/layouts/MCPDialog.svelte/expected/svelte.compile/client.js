import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as Tabs from "$lib/components/ui/tabs/index.js";
import Code from "$lib/components/ui/code/code.svelte";

const MCPCode = ($$anchor) => {
	Code($$anchor, {
		lang: 'bash',
		code: `{
  "mcpServers": {
    "jsrepo": {
      "command": "npx",
      "args": ["jsrepo", "mcp"]
    }
  }
}`,
		class: 'mb-4 border-none'
	});
};

var root = $.from_svg(`<svg class="size-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" fill-rule="evenodd" aria-labelledby="mcp-logo-title mcp-logo-description" viewBox="0 0 24 24"><title id="mcp-logo-title">ModelContextProtocol</title><desc id="mcp-logo-description">MCP logo</desc><path d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z"></path><path d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z"></path></svg> MCP`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`Add the following code to your <code class="rounded-sm bg-secondary px-1 py-0.5 font-mono text-primary">.cursor/mcp.json</code> file.`, 1);
var root_3 = $.from_html(`Add the following code to your <code class="rounded-sm bg-secondary px-1 py-0.5 font-mono text-primary">.codeium/windsurf/mcp_config.json</code> file.`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <div><!> <div class="mt-4 rounded-xl border"><!></div></div>`, 1);

export default function MCPDialog($$anchor) {
	var fragment_1 = $.comment();
	var node = $.first_child(fragment_1);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_1 = $.first_child(fragment_2);

				$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								size: 'sm',
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();

									$.next();
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'md:max-w-xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_5();
							var node_3 = $.first_child(fragment_5);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_1();
										var node_4 = $.first_child(fragment_6);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Setup MCP Server');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Use the code below to setup MCP in your project.');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_3, 2);
							var node_6 = $.child(div);

							$.component(node_6, () => Tabs.Root, ($$anchor, Tabs_Root) => {
								Tabs_Root($$anchor, {
									value: 'cursor',
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_4();
										var node_7 = $.first_child(fragment_7);

										$.component(node_7, () => Tabs.List, ($$anchor, Tabs_List) => {
											Tabs_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_1();
													var node_8 = $.first_child(fragment_8);

													$.component(node_8, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
														Tabs_Trigger($$anchor, {
															value: 'cursor',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Cursor');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
														Tabs_Trigger_1($$anchor, {
															value: 'windsurf',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Windsurf');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_7, 2);

										$.component(node_10, () => Tabs.Content, ($$anchor, Tabs_Content) => {
											Tabs_Content($$anchor, {
												value: 'cursor',
												class: 'text-sm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_9 = root_2();

													$.next(2);
													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
											Tabs_Content_1($$anchor, {
												value: 'windsurf',
												class: 'text-sm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_10 = root_3();

													$.next(2);
													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							var div_1 = $.sibling(node_6, 2);
							var node_12 = $.child(div_1);

							MCPCode(node_12);
							$.reset(div_1);
							$.reset(div);
							$.append($$anchor, fragment_5);
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
}