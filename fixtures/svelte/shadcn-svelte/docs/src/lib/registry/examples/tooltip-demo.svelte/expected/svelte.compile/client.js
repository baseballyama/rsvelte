import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { buttonVariants } from "../ui/button/index.js";

var root = $.from_html(`<p>Add to library</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_demo($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							{
								let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

								$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
									Tooltip_Trigger($$anchor, {
										get class() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Hover');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});
							}

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
								Tooltip_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var p = root();

										$.append($$anchor, p);
									},
									$$slots: { default: true }
								});
							});

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