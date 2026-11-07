import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Alert from "$lib/registry/ui/alert/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'icon',
	'title'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Callout($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("w-auto border bg-background text-foreground md:-mx-1", $$props.class));

		$.component(node, () => Alert.Root, ($$anchor, Alert_Root) => {
			Alert_Root($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => $$props.icon, ($$anchor, Icon_1) => {
									Icon_1($$anchor, {});
								});

								$.append($$anchor, fragment_2);
							};

							$.if(node_1, ($$render) => {
								if ($$props.icon) $$render(consequent);
							});
						}

						var node_3 = $.sibling(node_1, 2);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => Alert.Title, ($$anchor, Alert_Title) => {
									Alert_Title($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $$props.title));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							};

							$.if(node_3, ($$render) => {
								if ($$props.title) $$render(consequent_1);
							});
						}

						var node_5 = $.sibling(node_3, 2);

						$.component(node_5, () => Alert.Description, ($$anchor, Alert_Description) => {
							Alert_Description($$anchor, {
								class: 'text-card-foreground/80',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_6 = $.first_child(fragment_5);

									$.snippet(node_6, () => $$props.children ?? $.noop);
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

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