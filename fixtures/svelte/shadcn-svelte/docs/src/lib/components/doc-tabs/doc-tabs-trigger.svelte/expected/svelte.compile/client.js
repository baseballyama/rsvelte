import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

export default function Doc_tabs_trigger($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-base text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent", $$props.class));

		$.component(node, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
			Tabs_Trigger($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}