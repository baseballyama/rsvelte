import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from "$lib/components/ui/tabs/index.js";
import * as Frame from "$lib/components/ui/frame/index.js";
import MultipleCode from "$lib/components/ui/code/multiple-code.svelte";
import SingleCodeFilename from "../code/single-code-filename.svelte";
import { Button } from "$lib/components/ui/button";
import { cn } from "$lib/utils";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw-icon lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>`);
var root_2 = $.from_html(`<p class="text-muted-foreground">No component provided. Please provide a component to render.</p>`);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<div class="mt-2 w-full"><!> <div class="mt-1" data-toc-ignore=""><!></div></div>`);

export default function Preview_component($$anchor, $$props) {
	$.push($$props, true);

	let lang = $.prop($$props, 'lang', 3, "svelte"),
		showRetry = $.prop($$props, 'showRetry', 3, true),
		isCentered = $.prop($$props, 'isCentered', 3, true),
		className = $.prop($$props, 'class', 3, "");

	let value = $.state("preview");
	let retryKey = $.state(0);

	function handleRetry() {
		$.set(retryKey, $.get(retryKey) + 1);
	}

	var div = root_4();
	var node = $.child(div);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'bg-transparent',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'preview',
									class: 'border-none bg-transparent! pl-0 text-base shadow-none! ',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Preview');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'code',
									class: 'group border-none bg-transparent! text-base shadow-none! ',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Code');

										$.append($$anchor, text_1);
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

	var div_1 = $.sibling(node, 2);
	var node_4 = $.child(div_1);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_5 = $.first_child(fragment_2);

			$.component(node_5, () => Frame.Root, ($$anchor, Frame_Root) => {
				Frame_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_6 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => cn("relative min-h-64 w-full overflow-hidden p-6", className()));

							$.component(node_6, () => Frame.Panel, ($$anchor, Frame_Panel) => {
								Frame_Panel($$anchor, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_7 = $.first_child(fragment_4);

										{
											var consequent = ($$anchor) => {
												Button($$anchor, {
													variant: 'secondary',
													size: 'icon',
													onclick: handleRetry,
													class: 'absolute top-1.5 right-1.5 z-30',
													children: ($$anchor, $$slotProps) => {
														var svg = root_1();

														$.append($$anchor, svg);
													},
													$$slots: { default: true }
												});
											};

											$.if(node_7, ($$render) => {
												if (showRetry()) $$render(consequent);
											});
										}

										var node_8 = $.sibling(node_7, 2);

										$.key(node_8, () => $.get(retryKey), ($$anchor) => {
											var fragment_6 = $.comment();
											var node_9 = $.first_child(fragment_6);

											{
												var consequent_1 = ($$anchor) => {
													var fragment_7 = $.comment();
													var node_10 = $.first_child(fragment_7);

													$.snippet(node_10, () => $$props.children ?? $.noop);
													$.append($$anchor, fragment_7);
												};

												var alternate = ($$anchor) => {
													var p = root_2();

													$.append($$anchor, p);
												};

												$.if(node_9, ($$render) => {
													if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_6);
										});

										$.append($$anchor, fragment_4);
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

		var consequent_5 = ($$anchor) => {
			var div_2 = root_3();
			var node_11 = $.child(div_2);

			{
				var consequent_3 = ($$anchor) => {
					MultipleCode($$anchor, {
						get code() {
							return $$props.code;
						}
					});
				};

				var d = $.derived(() => Array.isArray($$props.code));

				var consequent_4 = ($$anchor) => {
					SingleCodeFilename($$anchor, {
						get code() {
							return $$props.code;
						}
					});
				};

				$.if(node_11, ($$render) => {
					if ($.get(d)) $$render(consequent_3); else if ($$props.code) $$render(consequent_4, 1);
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_4, ($$render) => {
			if ($.get(value) === "preview") $$render(consequent_2); else if ($.get(value) === "code") $$render(consequent_5, 1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}