import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(
	`<!> <div class="grid gap-4"><div class="rounded-md bg-black p-6"><pre><code class="grid gap-1 text-sm text-muted-foreground [&amp;_span]:h-4"><span><span class="text-sky-300">import</span> os</span><span><span class="text-sky-300">import</span> openai</span><span></span><span>openai.api_key = os.getenv(<span class="text-green-300">&quot;OPENAI_API_KEY&quot;</span>)</span><span></span><span>response = openai.Completion.create(</span><span> model=<span class="text-green-300">&quot;davinci&quot;</span>,</span><span> prompt=<span class="text-amber-300">&quot;&quot;</span>,</span><span> temperature=<span class="text-amber-300">0.9</span>,</span><span> max_tokens=<span class="text-amber-300">5</span>,</span><span> top_p=<span class="text-amber-300">1</span>,</span><span> frequency_penalty=<span class="text-amber-300">0</span>,</span><span> presence_penalty=<span class="text-green-300">0</span>,</span><span>)</span></code></pre></div> <div><p class="text-sm text-muted-foreground">Your API Key can be found here. You should use environment variables or a secret
					management tool to expose your key to your applications.</p></div></div>`,
	1
);

export default function Code_viewer($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: "secondary" }));

					$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('View code');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-[625px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('View code');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('You can use the following code to start integrating your current prompt and settings into\n				your application.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.next(2);
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

	$.append($$anchor, fragment);
	$.pop();
}