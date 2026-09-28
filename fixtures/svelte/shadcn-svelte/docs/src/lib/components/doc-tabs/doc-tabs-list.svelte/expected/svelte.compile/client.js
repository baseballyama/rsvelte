import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

export default function Doc_tabs_list($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("justify-start gap-4 rounded-none bg-transparent px-2 md:px-0", $$props.class));

		$.component(node, () => Tabs.List, ($$anchor, Tabs_List) => {
			Tabs_List($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					},
					'data-llm-ignore': true
				},
				() => restProps
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}