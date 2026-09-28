import * as $ from 'svelte/internal/server';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

export default function Code_viewer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Dialog.Root) {
			$$renderer.push('<!--[-->');

			Dialog.Root($$renderer, {
				children: ($$renderer) => {
					if (Dialog.Trigger) {
						$$renderer.push('<!--[-->');

						Dialog.Trigger($$renderer, {
							class: buttonVariants({ variant: "secondary" }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->View code`);
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
							class: 'sm:max-w-[625px]',
							children: ($$renderer) => {
								if (Dialog.Header) {
									$$renderer.push('<!--[-->');

									Dialog.Header($$renderer, {
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->View code`);
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
														$$renderer.push(`<!---->You can use the following code to start integrating your current prompt and settings into
				your application.`);
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

								$$renderer.push(` <div class="grid gap-4"><div class="rounded-md bg-black p-6"><pre><code class="grid gap-1 text-sm text-muted-foreground [&amp;_span]:h-4"><span><span class="text-sky-300">import</span> os</span><span><span class="text-sky-300">import</span> openai</span><span></span><span>openai.api_key = os.getenv(<span class="text-green-300">"OPENAI_API_KEY"</span>)</span><span></span><span>response = openai.Completion.create(</span><span> model=<span class="text-green-300">"davinci"</span>,</span><span> prompt=<span class="text-amber-300">""</span>,</span><span> temperature=<span class="text-amber-300">0.9</span>,</span><span> max_tokens=<span class="text-amber-300">5</span>,</span><span> top_p=<span class="text-amber-300">1</span>,</span><span> frequency_penalty=<span class="text-amber-300">0</span>,</span><span> presence_penalty=<span class="text-green-300">0</span>,</span><span>)</span></code></pre></div> <div><p class="text-sm text-muted-foreground">Your API Key can be found here. You should use environment variables or a secret
					management tool to expose your key to your applications.</p></div></div>`);
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
	});
}