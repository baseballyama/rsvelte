import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as Tabs from "$lib/components/ui/tabs/index.js";
import Code from "$lib/components/ui/code/code.svelte";

function MCPCode($$renderer) {
	Code($$renderer, {
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
}

export default function MCPDialog($$renderer) {
	if (Dialog.Root) {
		$$renderer.push('<!--[-->');

		Dialog.Root($$renderer, {
			children: ($$renderer) => {
				if (Dialog.Trigger) {
					$$renderer.push('<!--[-->');

					Dialog.Trigger($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								size: 'sm',
								variant: 'secondary',
								children: ($$renderer) => {
									$$renderer.push(`<svg class="size-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" fill-rule="evenodd" aria-labelledby="mcp-logo-title mcp-logo-description" viewBox="0 0 24 24"><title id="mcp-logo-title">ModelContextProtocol</title><desc id="mcp-logo-description">MCP logo</desc><path d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z"></path><path d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z"></path></svg> MCP`);
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

				$$renderer.push(` `);

				if (Dialog.Content) {
					$$renderer.push('<!--[-->');

					Dialog.Content($$renderer, {
						class: 'md:max-w-xl',
						children: ($$renderer) => {
							if (Dialog.Header) {
								$$renderer.push('<!--[-->');

								Dialog.Header($$renderer, {
									children: ($$renderer) => {
										if (Dialog.Title) {
											$$renderer.push('<!--[-->');

											Dialog.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Setup MCP Server`);
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
													$$renderer.push(`<!---->Use the code below to setup MCP in your project.`);
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

							$$renderer.push(` <div>`);

							if (Tabs.Root) {
								$$renderer.push('<!--[-->');

								Tabs.Root($$renderer, {
									value: 'cursor',
									children: ($$renderer) => {
										if (Tabs.List) {
											$$renderer.push('<!--[-->');

											Tabs.List($$renderer, {
												children: ($$renderer) => {
													if (Tabs.Trigger) {
														$$renderer.push('<!--[-->');

														Tabs.Trigger($$renderer, {
															value: 'cursor',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Cursor`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Tabs.Trigger) {
														$$renderer.push('<!--[-->');

														Tabs.Trigger($$renderer, {
															value: 'windsurf',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Windsurf`);
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

										if (Tabs.Content) {
											$$renderer.push('<!--[-->');

											Tabs.Content($$renderer, {
												value: 'cursor',
												class: 'text-sm',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Add the following code to your <code class="rounded-sm bg-secondary px-1 py-0.5 font-mono text-primary">.cursor/mcp.json</code> file.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tabs.Content) {
											$$renderer.push('<!--[-->');

											Tabs.Content($$renderer, {
												value: 'windsurf',
												class: 'text-sm',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Add the following code to your <code class="rounded-sm bg-secondary px-1 py-0.5 font-mono text-primary">.codeium/windsurf/mcp_config.json</code> file.`);
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

							$$renderer.push(` <div class="mt-4 rounded-xl border">`);
							MCPCode($$renderer);
							$$renderer.push(`<!----></div></div>`);
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
}