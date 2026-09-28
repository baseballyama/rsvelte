import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";
import { getColorFormat } from "$lib/colors.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'color', 'class']);
var root = $.from_html(`<span class="font-medium">Format:</span> <span class="font-mono text-muted-foreground"> </span>`, 1);
var root_1 = $.from_html(`<span class="font-medium"> </span> <span class="font-mono text-xs text-muted-foreground"> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Color_format_selector($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const userConfig = UserConfigContext.get();
	const formats = $.derived(() => getColorFormat($$props.color));
	var fragment = $.comment();
	var node = $.first_child(fragment);
	var bind_get = () => userConfig.current.colorFormat;

	var bind_set = (v) => {
		userConfig.setConfig({ colorFormat: v });
	};

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return bind_get();
			},

			set value($$value) {
				bind_set($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn("border-secondary bg-secondary text-secondary-foreground shadow-none", $$props.class));

					$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
						Select_Trigger($$anchor, $.spread_props(
							{
								size: 'sm',
								get class() {
									return $.get($0);
								}
							},
							() => restProps,
							{
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var span = $.sibling($.first_child(fragment_2), 2);
									var text = $.only_child(span, true);

									$.template_effect(() => $.set_text(text, userConfig.current.colorFormat));
									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							}
						));
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						align: 'end',
						class: 'rounded-xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.each(node_3, 17, () => Object.entries($.get(formats)), ([format, value]) => format, ($$anchor, $$item) => {
								var $$array = $.derived(() => $.to_array($.get($$item), 2));
								let format = () => $.get($$array)[0];
								let value = () => $.get($$array)[1];
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								$.component(node_4, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return format();
										},
										class: 'gap-2 rounded-lg [&>span]:flex [&>span]:items-center [&>span]:gap-2',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_1();
											var span_1 = $.first_child(fragment_5);
											var text_1 = $.only_child(span_1, true);
											var span_2 = $.sibling(span_1, 2);
											var text_2 = $.only_child(span_2, true);

											$.template_effect(() => {
												$.set_text(text_1, format());
												$.set_text(text_2, value());
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
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