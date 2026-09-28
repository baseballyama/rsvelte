import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { Collapsible } from "melt/components";
import { slide } from "svelte/transition";
import ChevronUpDown from "~icons/heroicons/chevron-up-down-solid";
import Close from "~icons/material-symbols/close-rounded";

var root = $.from_html(`<div><span>melt-ui/melt-ui</span> <hr class="border-b border-gray-700"/> <span>sveltejs/svelte</span> <hr class="border-b border-gray-700"/> <span>sveltejs/kit</span></div>`);
var root_1 = $.from_html(`<div class="mx-auto w-[18rem] max-w-full sm:w-[25rem]"><button><span>@thomasglopes starred 3 repositories</span> <!></button> <!></div>`);

export default function Collapsible_1($$anchor, $$props) {
	$.push($$props, true);

	const controls = usePreviewControls({
		disabled: { label: "Disabled", type: "boolean", defaultValue: false }
	});

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor, collapsible = $.noop) => {
					var div = root_1();
					var button = $.child(div);

					$.attribute_effect(button, () => ({
						...collapsible().trigger,
						class: 'relative z-10 mx-auto flex w-full items-center justify-between rounded-xl bg-gray-200\n				px-4 py-2 text-gray-800 transition-all hover:cursor-pointer hover:bg-gray-300\n				active:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50\n				dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50',
						'aria-label': 'Toggle',
						[$.CLASS]: { 'shadow-md': collapsible().open }
					}));

					var node = $.sibling($.child(button), 2);

					{
						var consequent = ($$anchor) => {
							Close($$anchor, {});
						};

						var alternate = ($$anchor) => {
							ChevronUpDown($$anchor, {});
						};

						$.if(node, ($$render) => {
							if (collapsible().open) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.reset(button);

					var node_1 = $.sibling(button, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_1 = root();

							$.attribute_effect(div_1, () => ({
								...collapsible().content,
								class: 'mx-auto flex w-[calc(100%-32px)] flex-col gap-2 rounded-b-xl bg-white p-4 dark:bg-gray-900 dark:text-white/80'
							}));

							$.transition(3, div_1, () => slide);
							$.append($$anchor, div_1);
						};

						$.if(node_1, ($$render) => {
							if (collapsible().open) $$render(consequent_1);
						});
					}

					$.reset(div);
					$.append($$anchor, div);
				};

				Collapsible($$anchor, $.spread_props(() => controls, { children, $$slots: { default: true } }));
			}
		},
		$$slots: { default: true }
	});

	$.pop();
}