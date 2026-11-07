import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Table from "../markdown/Table.svelte";
import Thead from "../markdown/Thead.svelte";
import Tbody from "../markdown/Tbody.svelte";
import Tr from "../markdown/Tr.svelte";
import Th from "../markdown/Th.svelte";
import Td from "../markdown/Td.svelte";
import InfoPopover from "./InfoPopover.svelte";
import { cn } from "$lib/utils";
import { H3 } from "../markdown";

var root = $.from_html(`<p class="m-0 leading-relaxed text-muted-foreground"> </p>`);
var root_1 = $.from_html(`<div class="space-y-2"><!> <!></div>`);
var root_2 = $.from_html(`<span class="inline-flex items-center"><code> </code> <!></span>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function APITable($$anchor, $$props) {
	$.push($$props, true);

	const isPropsTable = (data) => {
		return "props" in data;
	};

	let tableData = $.derived(() => isPropsTable($$props.data) ? $$props.data.props : $$props.data);
	let tableHeaders = ["Name", "Type", "Default", "Description"];
	let tableKeys = ["name", "type", "default", "description"];
	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			H3(node_1, {
				get id() {
					return $$props.data.name;
				},
				class: 'mt-0 text-xl font-semibold',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $$props.data.name));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var p = root();
					var text_1 = $.only_child(p, true);

					$.template_effect(() => $.set_text(text_1, $$props.data.desc));
					$.append($$anchor, p);
				};

				$.if(node_2, ($$render) => {
					if ($$props.data.desc) $$render(consequent);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		var d = $.derived(() => isPropsTable($$props.data));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent_1);
		});
	}

	var node_3 = $.sibling(node, 2);

	Table(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_3();
			var node_4 = $.first_child(fragment_2);

			Thead(node_4, {
				children: ($$anchor, $$slotProps) => {
					Tr($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.each(node_5, 16, () => tableHeaders, (header) => header, ($$anchor, header) => {
								Th($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, header));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Tbody(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = $.comment();
					var node_7 = $.first_child(fragment_7);

					$.each(node_7, 17, () => $.get(tableData), $.index, ($$anchor, row) => {
						Tr($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_9 = $.comment();
								var node_8 = $.first_child(fragment_9);

								$.each(node_8, 18, () => tableKeys, (key) => key, ($$anchor, key, index) => {
									Td($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var span = root_2();
											var code = $.child(span);
											var text_3 = $.only_child(code, true);
											var node_9 = $.sibling(code, 2);

											{
												var consequent_2 = ($$anchor) => {
													InfoPopover($$anchor, {
														get description() {
															return $.get(row).description;
														}
													});
												};

												$.if(node_9, ($$render) => {
													if ($.get(index) === 0 && $.get(row).description) $$render(consequent_2);
												});
											}

											$.reset(span);

											$.template_effect(
												($0) => {
													$.set_class(code, 1, $0);
													$.set_text(text_3, key === "default" && $.get(row).required ? "required" : $.get(row)[key] || "");
												},
												[
													() => $.clsx(cn("rounded-sm border  bg-muted/40 px-1.5 py-0.5 font-normal text-foreground"))
												]
											);

											$.append($$anchor, span);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_9);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}