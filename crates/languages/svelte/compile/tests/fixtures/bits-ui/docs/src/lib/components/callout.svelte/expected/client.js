import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Alert from "$lib/components/ui/alert/index.js";
import { cn } from "$lib/utils/styles.js";

var root = $.from_html(`<span class="dot absolute left-5 top-[25px] inline-block h-[10px] w-[10px] rounded-full"></span> <!> <!>`, 1);

export default function Callout($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, "note"),
		title = $.prop($$props, 'title', 19, () => type().split("").map((c, i) => i === 0 ? c.toUpperCase() : c).join(""));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("mt-6", $$props.class));

		$.component(node, () => Alert.Root, ($$anchor, Alert_Root) => {
			Alert_Root($$anchor, {
				get class() {
					return $.get($0);
				},

				get variant() {
					return type();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.sibling($.first_child(fragment_1), 2);

					{
						var consequent = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Alert.Title, ($$anchor, Alert_Title) => {
								Alert_Title($$anchor, {
									class: 'mb-2 ml-5 text-[15px] font-semibold',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, title()));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						};

						$.if(node_1, ($$render) => {
							if (title()) $$render(consequent);
						});
					}

					var node_3 = $.sibling(node_1, 2);

					$.component(node_3, () => Alert.Description, ($$anchor, Alert_Description) => {
						Alert_Description($$anchor, {
							class: 'leading-relaxed [&>p]:text-[15px] [&>p]:leading-7',
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								$.snippet(node_4, () => $$props.children ?? $.noop);
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}