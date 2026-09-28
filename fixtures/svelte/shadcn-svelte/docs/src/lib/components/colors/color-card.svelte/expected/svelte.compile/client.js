import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import ClipboardIcon from "@lucide/svelte/icons/clipboard";
import { PersistedState } from "runed";
import { toast } from "svelte-sonner";
import { scale } from "svelte/transition";
import * as Select from "$lib/registry/ui/select/index.js";
import { getColors } from "$lib/components/colors/colors.js";
import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";

var root = $.from_html(`<span class="me-2"><span class="font-bold">Format:</span> <span class="font-mono text-muted-foreground"> </span></span>`);
var root_1 = $.from_html(`<span><span> </span> <span class="font-mono text-muted-foreground"> </span></span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="size-full rounded-lg"></div>`);
var root_4 = $.from_html(`<div><!></div>`);
var root_5 = $.from_html(`<button type="button" class="group w-full flex-1 shrink-0 md:h-full md:w-auto"><div class="relative"><div class="hidden md:block"><!></div> <div class="block h-36 w-full rounded-lg md:hidden"></div> <div class="absolute end-2 top-2 opacity-0 transition-all group-hover:opacity-100"><!></div></div> <span class="hidden py-1 font-mono text-sm text-nowrap text-muted-foreground transition-colors group-hover:text-foreground xl:block"> </span> <span class="block py-1 font-mono text-sm text-nowrap text-muted-foreground transition-colors group-hover:text-foreground xl:hidden"> </span></button>`);
var root_6 = $.from_html(`<div class="flex w-full flex-col gap-2 rounded-lg border p-2"><div class="flex place-items-center justify-between"><h2> </h2> <!></div> <div class="flex flex-col place-items-end md:flex-row md:gap-2"></div></div>`);
var root_7 = $.from_html(`<div class="flex w-full flex-col gap-8"></div>`);

export default function Color_card($$anchor, $$props) {
	$.push($$props, true);

	const formats = [
		{ format: "className", hint: "bg-slate-100" },
		{ format: "hex", hint: "#f8fafc" },
		{ format: "rgb", hint: "248 250 252" },
		{ format: "hsl", hint: "210 40% 98%" },
		{ format: "oklch", hint: "0.98 0.00 248" }
	];

	const selectedFormat = new PersistedState("color-format-preference", formats[0].format);
	const colors = getColors();
	let copied = $.state(void 0);

	async function copy(shade) {
		$.set(copied, shade.className, true);

		const text = shade[selectedFormat.current];

		await navigator.clipboard.writeText(text);
		toast.success(`Copied ${text} to clipboard!`);

		setTimeout(
			() => {
				$.set(copied, undefined);
			},
			1000
		);
	}

	var div = root_7();

	$.each(div, 21, () => colors, (color) => color.name, ($$anchor, color) => {
		var div_1 = root_6();
		var div_2 = $.child(div_1);
		var h2 = $.child(div_2);
		var text_1 = $.only_child(h2, true);
		var node = $.sibling(h2, 2);

		$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
			Select_Root($$anchor, {
				type: 'single',
				get value() {
					return selectedFormat.current;
				},

				set value($$value) {
					selectedFormat.current = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment = root_2();
					var node_1 = $.first_child(fragment);

					$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
						Select_Trigger($$anchor, {
							class: 'h-7 w-fit text-xs',
							children: ($$anchor, $$slotProps) => {
								var span = root();
								var span_1 = $.sibling($.child(span), 2);
								var text_2 = $.only_child(span_1, true);

								$.reset(span);
								$.template_effect(() => $.set_text(text_2, selectedFormat.current));
								$.append($$anchor, span);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
						Select_Content($$anchor, {
							align: 'end',
							children: ($$anchor, $$slotProps) => {
								var fragment_1 = $.comment();
								var node_3 = $.first_child(fragment_1);

								$.each(node_3, 17, () => formats, (format) => format.format, ($$anchor, format) => {
									var fragment_2 = $.comment();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Select.Item, ($$anchor, Select_Item) => {
										Select_Item($$anchor, {
											get value() {
												return $.get(format).format;
											},

											children: ($$anchor, $$slotProps) => {
												var span_2 = root_1();
												var span_3 = $.child(span_2);
												var text_3 = $.only_child(span_3, true);
												var span_4 = $.sibling(span_3, 2);
												var text_4 = $.only_child(span_4, true);

												$.reset(span_2);

												$.template_effect(() => {
													$.set_text(text_3, $.get(format).format);
													$.set_text(text_4, $.get(format).hint);
												});

												$.append($$anchor, span_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
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

		$.reset(div_2);

		var div_3 = $.sibling(div_2, 2);

		$.each(div_3, 21, () => $.get(color).colors, (shade) => shade.className, ($$anchor, shade) => {
			var button = root_5();
			var div_4 = $.child(button);
			var div_5 = $.child(div_4);
			var node_5 = $.child(div_5);

			AspectRatio(node_5, {
				ratio: 12 / 16,
				children: ($$anchor, $$slotProps) => {
					var div_6 = root_3();

					$.template_effect(() => $.set_style(div_6, `background-color: ${$.get(shade).hex ?? ''};`));
					$.append($$anchor, div_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);

			var div_7 = $.sibling(div_5, 2);
			var div_8 = $.sibling(div_7, 2);
			var node_6 = $.child(div_8);

			{
				var consequent = ($$anchor) => {
					var div_9 = root_4();
					var node_7 = $.child(div_9);

					CheckIcon(node_7, { class: 'size-4' });
					$.reset(div_9);
					$.transition(1, div_9, () => scale);
					$.append($$anchor, div_9);
				};

				var alternate = ($$anchor) => {
					var div_10 = root_4();
					var node_8 = $.child(div_10);

					ClipboardIcon(node_8, { class: 'size-4' });
					$.reset(div_10);
					$.transition(1, div_10, () => scale);
					$.append($$anchor, div_10);
				};

				$.if(node_6, ($$render) => {
					if ($.get(copied) === $.get(shade).className) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_8);
			$.reset(div_4);

			var span_5 = $.sibling(div_4, 2);
			var text_5 = $.only_child(span_5, true);
			var span_6 = $.sibling(span_5, 2);
			var text_6 = $.only_child(span_6, true);

			$.reset(button);

			$.template_effect(
				($0) => {
					$.set_style(div_7, `background-color: ${$.get(shade).hex ?? ''};`);
					$.set_style(div_8, `color: ${$.get(shade).foreground ?? ''};`);
					$.set_text(text_5, $.get(shade).className);
					$.set_text(text_6, $0);
				},
				[() => $.get(shade).className.split("-")[1]]
			);

			$.delegated('click', button, () => copy($.get(shade)));
			$.append($$anchor, button);
		});

		$.reset(div_3);
		$.reset(div_1);

		$.template_effect(($0) => $.set_text(text_1, $0), [
			() => `${$.get(color).name[0].toUpperCase()}${$.get(color).name.slice(1)}`
		]);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);