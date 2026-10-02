import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch } from "bits-ui";
import Play from "phosphor-svelte/lib/Play";
import Pause from "phosphor-svelte/lib/Pause";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'checked', 'ref']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center space-x-3"><!></div>`);

export default function Home_switch($$anchor, $$props) {
	$.push($$props, true);

	let checked = $.prop($$props, 'checked', 15, true),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Switch.Root, ($$anchor, Switch_Root) => {
		Switch_Root($$anchor, $.spread_props(
			{
				id: 'play_btn',
				name: 'play',
				'aria-label': 'Play',
				class: 'focus-visible:ring-foreground focus-visible:ring-offset-background data-[state=checked]:bg-foreground data-[state=unchecked]:bg-dark-10 data-[state=unchecked]:shadow-mini-inset dark:data-[state=checked]:bg-foreground focus-visible:outline-hidden peer inline-flex h-7 min-h-7 w-11 shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:h-9 lg:min-h-9 lg:w-[62px]  dark:shadow-inner dark:data-[state=unchecked]:bg-[rgba(0,0,0,0.17)]'
			},
			() => restProps,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				get checked() {
					return checked();
				},

				set checked($$value) {
					checked($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment = $.comment();
					var node_1 = $.first_child(fragment);

					$.component(node_1, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
						Switch_Thumb($$anchor, {
							class: 'bg-background data-[state=unchecked]:shadow-mini dark:border-background/30 group pointer-events-none flex size-[22px] shrink-0 items-center justify-center rounded-full transition-transform data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-0 lg:size-[30px] lg:data-[state=checked]:translate-x-[26px] dark:border dark:border-none dark:bg-white dark:shadow-[0px_1.3px_0px_1.3px_rgba(0,0,0,0.04)] dark:data-[state=unchecked]:border',
							children: ($$anchor, $$slotProps) => {
								var fragment_1 = root();
								var node_2 = $.first_child(fragment_1);

								Play(node_2, {
									class: 'size-2.5 group-data-[state=checked]:hidden lg:size-4 dark:text-[#171717]',
									weight: 'fill',
									'aria-label': 'Play'
								});

								var node_3 = $.sibling(node_2, 2);

								Pause(node_3, {
									class: 'size-2.5 group-data-[state=unchecked]:hidden lg:size-4 dark:text-[#171717]',
									weight: 'fill',
									'aria-label': 'Pause'
								});

								$.append($$anchor, fragment_1);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			}
		));
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}