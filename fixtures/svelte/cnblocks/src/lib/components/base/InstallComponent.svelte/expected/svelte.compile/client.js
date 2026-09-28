import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";
import * as Tabs from "$lib/components/ui/tabs";
import { PMCommand } from "$lib/components/ui/pm-command";
import Steps from "$lib/components/markdown/Steps.svelte";
import Step from "$lib/components/markdown/Step.svelte";
import SingleCodeFilename from "$lib/components/ui/code/single-code-filename.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);

export default function InstallComponent($$anchor, $$props) {
	$.push($$props, true);

	let activeTab = $.state("cli");
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			get value() {
				return $.get(activeTab);
			},

			set value($$value) {
				$.set(activeTab, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'h-auto gap-2 rounded-none bg-transparent px-0 py-1 text-foreground',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'cli',
									class: 'relative border-none bg-transparent! px-4 after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('CLI');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'cli',
						class: 'mt-4',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => ["shadcn-svelte@latest", "add", $$props.installUrl]);

								PMCommand($$anchor, {
									command: 'execute',
									get args() {
										return $.get($0);
									}
								});
							}
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn("w-full", $$props.class))]);
	$.append($$anchor, div);
	$.pop();
}