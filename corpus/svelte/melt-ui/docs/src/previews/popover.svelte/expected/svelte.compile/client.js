import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Preview from "@components/preview.svelte";
import { Popover as PopoverComponent } from "melt/components";
import { Popover } from "melt/builders";
import { usePreviewControls } from "@components/preview-ctx.svelte";

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<button>yes</button> <div>you're awesome</div>`, 1);
var root_2 = $.from_html(`<button>psst...</button> <div><!> <p class="text-center font-semibold">Can I tell you a secret?</p> <div class="mt-4 flex items-center justify-center gap-4"><!></div></div>`, 1);

export default function Popover_1($$anchor, $$props) {
	$.push($$props, true);

	const controls = usePreviewControls({
		arrow: { label: "Show arrow", type: "boolean", defaultValue: false }
	});

	const popover = new Popover({ forceVisible: true });

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var button = $.first_child(fragment_1);

			$.attribute_effect(
				button,
				() => ({
					class: 'mx-auto block rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-800\n				transition-all hover:cursor-pointer hover:bg-gray-200\n				active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50\n				dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50',
					...popover.trigger
				}),
				void 0,
				void 0,
				void 0,
				'svelte-ishmsc'
			);

			var div = $.sibling(button, 2);

			$.attribute_effect(
				div,
				() => ({
					class: 'w-[260px] overflow-visible rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800',
					...popover.content
				}),
				void 0,
				void 0,
				void 0,
				'svelte-ishmsc'
			);

			var node = $.child(div);

			{
				var consequent = ($$anchor) => {
					var div_1 = root();

					$.attribute_effect(div_1, () => ({ ...popover.arrow, class: 'size-2 rounded-tl' }), void 0, void 0, void 0, 'svelte-ishmsc');
					$.append($$anchor, div_1);
				};

				$.if(node, ($$render) => {
					if (controls.arrow) $$render(consequent);
				});
			}

			var div_2 = $.sibling(node, 4);
			var node_1 = $.child(div_2);

			{
				const children = ($$anchor, popover2 = $.noop) => {
					var fragment_2 = root_1();
					var button_1 = $.first_child(fragment_2);

					$.attribute_effect(
						button_1,
						() => ({
							class: 'border-b-2 border-dashed bg-transparent transition hover:cursor-pointer hover:opacity-75 active:opacity-50',
							...popover2().trigger
						}),
						void 0,
						void 0,
						void 0,
						'svelte-ishmsc'
					);

					var div_3 = $.sibling(button_1, 2);

					$.attribute_effect(
						div_3,
						() => ({
							...popover2().content,
							class: 'rounded-xl bg-gray-100 p-4 shadow-xl backdrop-blur dark:bg-gray-700'
						}),
						void 0,
						void 0,
						void 0,
						'svelte-ishmsc'
					);

					$.append($$anchor, fragment_2);
				};

				PopoverComponent(node_1, { forceVisible: true, children, $$slots: { default: true } });
			}

			$.reset(div_2);
			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}