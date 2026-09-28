import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";
import * as Tabs from "$lib/components/ui/tabs";
import { PMCommand } from "$lib/components/ui/pm-command";
import Steps from "$lib/components/markdown/Steps.svelte";
import Step from "$lib/components/markdown/Step.svelte";
import SingleCodeFilename from "$lib/components/ui/code/single-code-filename.svelte";

export default function InstallComponent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { installUrl, class: className } = $$props;
		let activeTab = "cli";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(cn("w-full", className)))}>`);

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					get value() {
						return activeTab;
					},

					set value($$value) {
						activeTab = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'h-auto gap-2 rounded-none bg-transparent px-0 py-1 text-foreground',
								children: ($$renderer) => {
									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'cli',
											class: 'relative border-none bg-transparent! px-4 after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent',
											children: ($$renderer) => {
												$$renderer.push(`<!---->CLI`);
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
								value: 'cli',
								class: 'mt-4',
								children: ($$renderer) => {
									PMCommand($$renderer, {
										command: 'execute',
										args: ["shadcn-svelte@latest", "add", installUrl]
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

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}