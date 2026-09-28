import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MediaQuery } from "svelte/reactivity";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import ChartCopyButton from "./chart-copy-button.svelte";
import { getIconForLanguageExtension } from "./icons/icons.js";

const Trigger = ($$anchor, $$arg0) => {
	let props = () => ($$arg0?.()).props;

	Button($$anchor, $.spread_props({ size: 'sm', variant: 'outline' }, props, {
		class: 'h-6 rounded-[6px] border bg-transparent px-2 text-xs text-foreground shadow-none hover:bg-muted dark:text-foreground',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('View Code');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	}));
};

var root = $.from_html(`<div class="flex min-h-0 flex-1 flex-col gap-0"><div class="chart-wrapper hidden theme-container **:data-chart:mx-auto **:data-chart:max-h-[35vh] sm:block [&amp;>div]:rounded-none [&amp;>div]:border-0 [&amp;>div]:border-b [&amp;>div]:shadow-none"><!></div> <div class="flex min-w-0 flex-1 flex-col overflow-hidden p-4"><figure data-rehype-pretty-code-figure="" class="mt-0 flex h-auto min-w-0 flex-1 flex-col overflow-hidden"><figcaption class="flex h-12 shrink-0 items-center gap-2 border-b py-2 ps-4 pe-2 text-foreground [&amp;>svg]:size-4 [&amp;>svg]:text-foreground [&amp;>svg]:opacity-70" data-language="tsx"><!> <div class="ms-auto flex items-center gap-2"><!></div></figcaption> <div class="no-scrollbar overflow-y-auto"></div></figure></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="flex h-full flex-col overflow-auto"><!></div>`, 1);

export default function Chart_code_viewer($$anchor, $$props) {
	$.push($$props, true);

	const Content = ($$anchor) => {
		var div = root();
		var div_1 = $.child(div);
		var node = $.child(div_1);

		$.snippet(node, () => $$props.children ?? $.noop);
		$.reset(div_1);

		var div_2 = $.sibling(div_1, 2);
		var figure = $.child(div_2);
		var figcaption = $.child(figure);
		var node_1 = $.child(figcaption);

		Icon(node_1, {});

		var text = $.sibling(node_1);
		var div_3 = $.sibling(text);
		var node_2 = $.child(div_3);

		ChartCopyButton(node_2, {
			get name() {
				return $$props.chart.name;
			},

			get code() {
				return $$props.code;
			}
		});

		$.reset(div_3);
		$.reset(figcaption);

		var div_4 = $.sibling(figcaption, 2);

		$.html(div_4, () => $$props.chart.files?.[0]?.highlightedContent ?? "", true);
		$.reset(div_4);
		$.reset(figure);
		$.reset(div_2);
		$.reset(div);
		$.template_effect(() => $.set_text(text, ` ${$$props.chart.name ?? ''} `));
		$.append($$anchor, div);
	};

	const isDesktop = new MediaQuery("min-width: 768px");
	const Icon = getIconForLanguageExtension("svelte");
	var fragment_1 = $.comment();
	var node_3 = $.first_child(fragment_1);

	{
		var consequent = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			$.component(node_4, () => Drawer.Root, ($$anchor, Drawer_Root) => {
				Drawer_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_5 = $.first_child(fragment_3);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Trigger($$anchor, () => ({ props: props() }));
							};

							$.component(node_5, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
								Drawer_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_6 = $.sibling(node_5, 2);

						{
							let $0 = $.derived(() => cn("flex max-h-[80vh] flex-col sm:max-h-[90vh] [&>div.bg-muted]:shrink-0", $$props.class));

							$.component(node_6, () => Drawer.Content, ($$anchor, Drawer_Content) => {
								Drawer_Content($$anchor, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_2();
										var node_7 = $.first_child(fragment_5);

										$.component(node_7, () => Drawer.Header, ($$anchor, Drawer_Header) => {
											Drawer_Header($$anchor, {
												class: 'sr-only',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_1();
													var node_8 = $.first_child(fragment_6);

													$.component(node_8, () => Drawer.Title, ($$anchor, Drawer_Title) => {
														Drawer_Title($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Code');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Drawer.Description, ($$anchor, Drawer_Description) => {
														Drawer_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('View the code for the chart.');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var div_5 = $.sibling(node_7, 2);
										var node_10 = $.child(div_5);

										Content(node_10);
										$.reset(div_5);
										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		};

		var alternate = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_11 = $.first_child(fragment_7);

			$.component(node_11, () => Sheet.Root, ($$anchor, Sheet_Root) => {
				Sheet_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_1();
						var node_12 = $.first_child(fragment_8);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Trigger($$anchor, () => ({ props: props() }));
							};

							$.component(node_12, () => Sheet.Trigger, ($$anchor, Sheet_Trigger) => {
								Sheet_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_13 = $.sibling(node_12, 2);

						{
							let $0 = $.derived(() => cn("flex flex-col gap-0 border-s-0 p-0 sm:max-w-sm md:w-[700px] md:max-w-[700px] dark:border-s", $$props.class));

							$.component(node_13, () => Sheet.Content, ($$anchor, Sheet_Content) => {
								Sheet_Content($$anchor, {
									side: 'right',
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root_1();
										var node_14 = $.first_child(fragment_10);

										$.component(node_14, () => Sheet.Header, ($$anchor, Sheet_Header) => {
											Sheet_Header($$anchor, {
												class: 'sr-only',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root_1();
													var node_15 = $.first_child(fragment_11);

													$.component(node_15, () => Sheet.Title, ($$anchor, Sheet_Title) => {
														Sheet_Title($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Code');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_15, 2);

													$.component(node_16, () => Sheet.Description, ($$anchor, Sheet_Description) => {
														Sheet_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('View the code for the chart.');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_14, 2);

										Content(node_17);
										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_7);
		};

		$.if(node_3, ($$render) => {
			if (!isDesktop.current) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}