import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";
import MagicWand from "phosphor-svelte/lib/MagicWand";

var root = $.from_html(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 flex items-center justify-center border p-3 text-sm font-medium">Make some magic!</div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center gap-6"><div class="rounded-md border p-3">Custom Anchor</div> <!></div>`);

export default function Tooltip_demo_custom_anchor($$anchor) {
	let customAnchor = $.state(null);
	var div = root_2();
	var div_1 = $.child(div);

	$.bind_this(div_1, ($$value) => $.set(customAnchor, $$value), () => $.get(customAnchor));

	var node = $.sibling(div_1, 2);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						delayDuration: 200,
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									class: 'border-border-input bg-background-alt shadow-btn ring-dark ring-offset-background\n			hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex size-10 items-center justify-center rounded-full border focus-visible:ring-2 focus-visible:ring-offset-2',
									children: ($$anchor, $$slotProps) => {
										MagicWand($$anchor, { class: 'size-5' });
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
								Tooltip_Content($$anchor, {
									sideOffset: 8,
									get customAnchor() {
										return $.get(customAnchor);
									},
									class: 'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-tooltip-content-transform-origin)',
									children: ($$anchor, $$slotProps) => {
										var div_2 = root();

										$.append($$anchor, div_2);
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
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}