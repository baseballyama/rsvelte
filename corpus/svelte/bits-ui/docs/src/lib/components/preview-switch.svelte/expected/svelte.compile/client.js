import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch } from "bits-ui";
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'checked']);

export default function Preview_switch($$anchor, $$props) {
	$.push($$props, true);

	let checked = $.prop($$props, 'checked', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary/60 focus-visible:ring-offset-background shadow-xs focus-visible:outline-hidden peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", $$props.class));

		$.component(node, () => Switch.Root, ($$anchor, Switch_Root) => {
			Switch_Root($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get checked() {
						return checked();
					},

					set checked($$value) {
						checked($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						{
							let $0 = $.derived(() => cn("data-[state=checked]:bg-background data-[state=unchecked]:bg-accent pointer-events-none relative inline-block h-4 w-4 transform rounded-full shadow-lg ring-0 transition-all ease-in-out data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"));

							$.component(node_1, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
								Switch_Thumb($$anchor, {
									get class() {
										return $.get($0);
									}
								});
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}