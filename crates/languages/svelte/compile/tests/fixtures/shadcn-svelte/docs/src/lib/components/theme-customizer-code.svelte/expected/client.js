import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@tabler/icons-svelte/icons/check";
import CopyIcon from "@tabler/icons-svelte/icons/copy";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import ColorIndicator from "./color-indicator.svelte";
import Css from "./icons/css.svelte";
import { getThemeCodeOKLCH, getThemeCodeHSLV4, getThemeCode } from "./theme-customizer.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

var root_1 = $.from_html(
	`
						<!>
					`,
	1
);

var root_2 = $.from_html(
	`
					<span class="sr-only">Copy</span>
					<!>
				`,
	1
);

var root_3 = $.from_html(
	`
						<span data-line="" class="line text-code-foreground"> <!> </span>
					`,
	1
);

var root_4 = $.from_html(`<figure data-rehype-pretty-code-figure="" class="mx-0! mt-0 rounded-lg"><figcaption class="flex items-center gap-2 text-code-foreground [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70" data-rehype-pretty-code-title="" data-language="css" data-theme="github-dark github-light-default"><!> app/globals.css</figcaption> <pre class="no-scrollbar max-h-[300px] min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-data-highlighted-line:px-0 has-data-line-numbers:px-0 has-data-[slot=tabs]:p-0 md:max-h-[450px]">
				<!>
				<code data-line-numbers="" data-language="css" class="-my-10">
					<span data-line="" class="line text-code-foreground">&nbsp;:root &#123;</span>
					<span data-line="" class="line text-code-foreground">&nbsp;&nbsp;&nbsp;--radius: 0.65rem;</span>
					<!>
					<span data-line="" class="line text-code-foreground">&nbsp;&#125;</span>
					<span data-line="" class="line text-code-foreground">&nbsp;</span>
					<span data-line="" class="line text-code-foreground">&nbsp;.dark &#123;</span>
					<!>
					<span data-line="" class="line text-code-foreground">&nbsp;&#125;</span>
				</code>
			</pre></figure>`);

var root_5 = $.from_html(
	`
					<span class="sr-only" data-llm-ignore="">Copy</span>
					<!>
				`,
	1
);

var root_6 = $.from_html(
	`
						<span data-line="" class="line"> <!> </span>
						<span data-line="" class="line"> <!> </span>
					`,
	1
);

var root_7 = $.from_html(
	`
						<span data-line="" class="line"> <!> </span>
					`,
	1
);

var root_8 = $.from_html(`<figure data-rehype-pretty-code-figure="" class="mx-0! mt-0 rounded-lg"><figcaption class="flex items-center gap-2 text-code-foreground [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70" data-rehype-pretty-code-title="" data-language="css" data-theme="github-dark github-light-default"><!> app/globals.css</figcaption> <pre class="no-scrollbar max-h-[300px] min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-data-highlighted-line:px-0 has-data-line-numbers:px-0 has-data-[slot=tabs]:p-0 md:max-h-[450px]">
				<!>
				<code data-line-numbers="" data-language="css" class="-my-10">
					<span data-line="" class="line">@layer base &#123;</span>
					<span data-line="" class="line">&nbsp;&nbsp;:root &#123;</span>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--background: <!> </span>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--foreground: <!> </span>
					<!>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--border: <!> </span>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--input: <!> </span>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--ring: <!> </span>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--radius: 0.5rem;</span>
					<!>
					<span data-line="" class="line">&nbsp;&nbsp;&#125;</span>
					<span data-line="" class="line">&nbsp;</span>
					<span data-line="" class="line">&nbsp;&nbsp;.dark &#123;</span>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--background: <!> </span>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--foreground: <!> </span>
					<!>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--border: <!> </span>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--input: <!> </span>
					<span data-line="" class="line">&nbsp;&nbsp;&nbsp;&nbsp;--ring: <!> </span>
					<!>
					<span data-line="" class="line">&nbsp;&nbsp;&#125;</span>
					<span data-line="" class="line">&#125;</span>
				</code>
			</pre></figure>`);

var root_9 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Theme_customizer_code($$anchor, $$props) {
	$.push($$props, true);

	let tailwindVersion = $.prop($$props, 'tailwindVersion', 7);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			get value() {
				return tailwindVersion();
			},
			onValueChange: (v) => tailwindVersion(v),
			class: 'min-w-0 px-4 pb-4 md:p-0',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_9();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'v4-oklch',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('OKLCH');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'v4-hsl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('HSL');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
								Tabs_Trigger_2($$anchor, {
									value: 'v3',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Tailwind v3');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'v4-oklch',
						children: ($$anchor, $$slotProps) => {
							var figure = root_4();
							var figcaption = $.child(figure);
							var node_6 = $.child(figcaption);

							Css(node_6, { class: 'fill-foreground' });
							$.next();
							$.reset(figcaption);

							var pre = $.sibling(figcaption, 2);
							var node_7 = $.sibling($.child(pre));

							Button(node_7, {
								'data-slot': 'copy-button',
								size: 'icon',
								variant: 'ghost',
								class: 'absolute top-3 right-2 z-10 size-7 bg-code text-code-foreground shadow-none hover:opacity-100 focus-visible:opacity-100',
								onclick: () => {
									$$props.copyToClipboard(getThemeCodeOKLCH($$props.activeThemeOKLCH, 0.65));
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_3 = root_2();
									var node_8 = $.sibling($.first_child(fragment_3), 3);

									{
										var consequent = ($$anchor) => {
											var fragment_4 = root_1();
											var node_9 = $.sibling($.first_child(fragment_4));

											CheckIcon(node_9, {});
											$.next();
											$.append($$anchor, fragment_4);
										};

										var alternate = ($$anchor) => {
											var fragment_5 = root_1();
											var node_10 = $.sibling($.first_child(fragment_5));

											CopyIcon(node_10, {});
											$.next();
											$.append($$anchor, fragment_5);
										};

										$.if(node_8, ($$render) => {
											if ($$props.hasCopied) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.next();
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							var code = $.sibling(node_7, 2);
							var node_11 = $.sibling($.child(code), 5);

							$.each(node_11, 17, () => Object.entries($$props.activeThemeOKLCH?.light || {}), ([key, value]) => key, ($$anchor, $$item) => {
								var $$array = $.derived(() => $.to_array($.get($$item), 2));
								let key = () => $.get($$array)[0];
								let value = () => $.get($$array)[1];

								$.next();

								var fragment_6 = root_3();
								var span = $.sibling($.first_child(fragment_6));
								var text_3 = $.child(span);
								var node_12 = $.sibling(text_3);

								ColorIndicator(node_12, {
									get color() {
										return value();
									}
								});

								var text_4 = $.sibling(node_12);

								$.reset(span);
								$.next();

								$.template_effect(() => {
									$.set_text(text_3, `   --${key() ?? ''}: `);
									$.set_text(text_4, ` ${value() ?? ''};`);
								});

								$.append($$anchor, fragment_6);
							});

							var node_13 = $.sibling(node_11, 8);

							$.each(node_13, 17, () => Object.entries($$props.activeThemeOKLCH?.dark || {}), ([key, value]) => key, ($$anchor, $$item) => {
								var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
								let key = () => $.get($$array_1)[0];
								let value = () => $.get($$array_1)[1];

								$.next();

								var fragment_7 = root_3();
								var span_1 = $.sibling($.first_child(fragment_7));
								var text_5 = $.child(span_1);
								var node_14 = $.sibling(text_5);

								ColorIndicator(node_14, {
									get color() {
										return value();
									}
								});

								var text_6 = $.sibling(node_14);

								$.reset(span_1);
								$.next();

								$.template_effect(() => {
									$.set_text(text_5, `   --${key() ?? ''}: `);
									$.set_text(text_6, ` ${value() ?? ''};`);
								});

								$.append($$anchor, fragment_7);
							});

							$.next(3);
							$.reset(code);
							$.next();
							$.reset(pre);
							$.reset(figure);
							$.append($$anchor, figure);
						},
						$$slots: { default: true }
					});
				});

				var node_15 = $.sibling(node_5, 2);

				$.component(node_15, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
					Tabs_Content_1($$anchor, {
						value: 'v4-hsl',
						children: ($$anchor, $$slotProps) => {
							var figure_1 = root_4();
							var figcaption_1 = $.child(figure_1);
							var node_16 = $.child(figcaption_1);

							Css(node_16, { class: 'fill-foreground' });
							$.next();
							$.reset(figcaption_1);

							var pre_1 = $.sibling(figcaption_1, 2);
							var node_17 = $.sibling($.child(pre_1));

							Button(node_17, {
								'data-slot': 'copy-button',
								size: 'icon',
								variant: 'ghost',
								class: 'absolute top-3 right-2 z-10 size-7 bg-code text-code-foreground shadow-none hover:opacity-100 focus-visible:opacity-100',
								onclick: () => {
									$$props.copyToClipboard(getThemeCodeHSLV4($$props.activeTheme, 0.65));
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_8 = root_5();
									var node_18 = $.sibling($.first_child(fragment_8), 3);

									{
										var consequent_1 = ($$anchor) => {
											var fragment_9 = root_1();
											var node_19 = $.sibling($.first_child(fragment_9));

											CheckIcon(node_19, {});
											$.next();
											$.append($$anchor, fragment_9);
										};

										var alternate_1 = ($$anchor) => {
											var fragment_10 = root_1();
											var node_20 = $.sibling($.first_child(fragment_10));

											CopyIcon(node_20, {});
											$.next();
											$.append($$anchor, fragment_10);
										};

										$.if(node_18, ($$render) => {
											if ($$props.hasCopied) $$render(consequent_1); else $$render(alternate_1, -1);
										});
									}

									$.next();
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var code_1 = $.sibling(node_17, 2);
							var node_21 = $.sibling($.child(code_1), 5);

							$.each(node_21, 17, () => Object.entries($$props.activeTheme?.cssVars.light || {}), ([key, value]) => key, ($$anchor, $$item) => {
								var $$array_2 = $.derived(() => $.to_array($.get($$item), 2));
								let key = () => $.get($$array_2)[0];
								let value = () => $.get($$array_2)[1];

								$.next();

								var fragment_11 = root_3();
								var span_2 = $.sibling($.first_child(fragment_11));
								var text_7 = $.child(span_2);
								var node_22 = $.sibling(text_7);

								{
									let $0 = $.derived(() => `hsl(${value()})`);

									ColorIndicator(node_22, {
										get color() {
											return $.get($0);
										}
									});
								}

								var text_8 = $.sibling(node_22);

								$.reset(span_2);
								$.next();

								$.template_effect(() => {
									$.set_text(text_7, `   --${key() ?? ''}: `);
									$.set_text(text_8, ` hsl(${value() ?? ''});`);
								});

								$.append($$anchor, fragment_11);
							});

							var node_23 = $.sibling(node_21, 8);

							$.each(node_23, 17, () => Object.entries($$props.activeTheme?.cssVars.dark || {}), ([key, value]) => key, ($$anchor, $$item) => {
								var $$array_3 = $.derived(() => $.to_array($.get($$item), 2));
								let key = () => $.get($$array_3)[0];
								let value = () => $.get($$array_3)[1];

								$.next();

								var fragment_12 = root_3();
								var span_3 = $.sibling($.first_child(fragment_12));
								var text_9 = $.child(span_3);
								var node_24 = $.sibling(text_9);

								{
									let $0 = $.derived(() => `hsl(${value()})`);

									ColorIndicator(node_24, {
										get color() {
											return $.get($0);
										}
									});
								}

								var text_10 = $.sibling(node_24);

								$.reset(span_3);
								$.next();

								$.template_effect(() => {
									$.set_text(text_9, `   --${key() ?? ''}: `);
									$.set_text(text_10, ` hsl(${value() ?? ''});`);
								});

								$.append($$anchor, fragment_12);
							});

							$.next(3);
							$.reset(code_1);
							$.next();
							$.reset(pre_1);
							$.reset(figure_1);
							$.append($$anchor, figure_1);
						},
						$$slots: { default: true }
					});
				});

				var node_25 = $.sibling(node_15, 2);

				$.component(node_25, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
					Tabs_Content_2($$anchor, {
						value: 'v3',
						children: ($$anchor, $$slotProps) => {
							var figure_2 = root_8();
							var figcaption_2 = $.child(figure_2);
							var node_26 = $.child(figcaption_2);

							Css(node_26, { class: 'fill-foreground' });
							$.next();
							$.reset(figcaption_2);

							var pre_2 = $.sibling(figcaption_2, 2);
							var node_27 = $.sibling($.child(pre_2));

							Button(node_27, {
								'data-slot': 'copy-button',
								size: 'icon',
								variant: 'ghost',
								class: 'absolute top-3 right-2 z-10 size-7 bg-code text-code-foreground shadow-none hover:opacity-100 focus-visible:opacity-100',
								onclick: () => {
									$$props.copyToClipboard(getThemeCode($$props.activeTheme, 0.5));
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_13 = root_2();
									var node_28 = $.sibling($.first_child(fragment_13), 3);

									{
										var consequent_2 = ($$anchor) => {
											var fragment_14 = root_1();
											var node_29 = $.sibling($.first_child(fragment_14));

											CheckIcon(node_29, {});
											$.next();
											$.append($$anchor, fragment_14);
										};

										var alternate_2 = ($$anchor) => {
											var fragment_15 = root_1();
											var node_30 = $.sibling($.first_child(fragment_15));

											CopyIcon(node_30, {});
											$.next();
											$.append($$anchor, fragment_15);
										};

										$.if(node_28, ($$render) => {
											if ($$props.hasCopied) $$render(consequent_2); else $$render(alternate_2, -1);
										});
									}

									$.next();
									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});

							var code_2 = $.sibling(node_27, 2);
							var span_4 = $.sibling($.child(code_2), 5);
							var node_31 = $.sibling($.child(span_4));

							{
								let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.light["background"]})`);

								ColorIndicator(node_31, {
									get color() {
										return $.get($0);
									}
								});
							}

							var text_11 = $.sibling(node_31);

							$.reset(span_4);

							var span_5 = $.sibling(span_4, 2);
							var node_32 = $.sibling($.child(span_5));

							{
								let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.light["foreground"]})`);

								ColorIndicator(node_32, {
									get color() {
										return $.get($0);
									}
								});
							}

							var text_12 = $.sibling(node_32);

							$.reset(span_5);

							var node_33 = $.sibling(span_5, 2);

							$.each(
								node_33,
								16,
								() => [
									"card",
									"popover",
									"primary",
									"secondary",
									"muted",
									"accent",
									"destructive"
								],
								(prefix) => prefix,
								($$anchor, prefix) => {
									$.next();

									var fragment_16 = root_6();
									var span_6 = $.sibling($.first_child(fragment_16));
									var text_13 = $.child(span_6);
									var node_34 = $.sibling(text_13);

									{
										let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.light[prefix] || ""})`);

										ColorIndicator(node_34, {
											get color() {
												return $.get($0);
											}
										});
									}

									var text_14 = $.sibling(node_34);

									$.reset(span_6);

									var span_7 = $.sibling(span_6, 2);
									var text_15 = $.child(span_7);
									var node_35 = $.sibling(text_15);

									{
										let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.light[`${prefix}-foreground`] || ""})`);

										ColorIndicator(node_35, {
											get color() {
												return $.get($0);
											}
										});
									}

									var text_16 = $.sibling(node_35);

									$.reset(span_7);
									$.next();

									$.template_effect(() => {
										$.set_text(text_13, `    --${prefix ?? ''}: `);
										$.set_text(text_14, ` ${$$props.activeTheme?.cssVars.light[prefix] ?? ''};`);
										$.set_text(text_15, `    --${prefix ?? ''}-foreground: `);
										$.set_text(text_16, ` ${$$props.activeTheme?.cssVars.light[`${prefix}-foreground`] ?? ''};`);
									});

									$.append($$anchor, fragment_16);
								}
							);

							var span_8 = $.sibling(node_33, 2);
							var node_36 = $.sibling($.child(span_8));

							{
								let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.light["border"]})`);

								ColorIndicator(node_36, {
									get color() {
										return $.get($0);
									}
								});
							}

							var text_17 = $.sibling(node_36);

							$.reset(span_8);

							var span_9 = $.sibling(span_8, 2);
							var node_37 = $.sibling($.child(span_9));

							{
								let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.light["input"]})`);

								ColorIndicator(node_37, {
									get color() {
										return $.get($0);
									}
								});
							}

							var text_18 = $.sibling(node_37);

							$.reset(span_9);

							var span_10 = $.sibling(span_9, 2);
							var node_38 = $.sibling($.child(span_10));

							{
								let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.light["ring"]})`);

								ColorIndicator(node_38, {
									get color() {
										return $.get($0);
									}
								});
							}

							var text_19 = $.sibling(node_38);

							$.reset(span_10);

							var node_39 = $.sibling(span_10, 4);

							$.each(node_39, 16, () => ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"], (prefix) => prefix, ($$anchor, prefix) => {
								$.next();

								var fragment_17 = root_7();
								var span_11 = $.sibling($.first_child(fragment_17));
								var text_20 = $.child(span_11);
								var node_40 = $.sibling(text_20);

								{
									let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.light[prefix] || ""})`);

									ColorIndicator(node_40, {
										get color() {
											return $.get($0);
										}
									});
								}

								var text_21 = $.sibling(node_40);

								$.reset(span_11);
								$.next();

								$.template_effect(() => {
									$.set_text(text_20, `    --${prefix ?? ''}: `);
									$.set_text(text_21, ` ${$$props.activeTheme?.cssVars.light[prefix] ?? ''};`);
								});

								$.append($$anchor, fragment_17);
							});

							var span_12 = $.sibling(node_39, 8);
							var node_41 = $.sibling($.child(span_12));

							{
								let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.dark["background"]})`);

								ColorIndicator(node_41, {
									get color() {
										return $.get($0);
									}
								});
							}

							var text_22 = $.sibling(node_41);

							$.reset(span_12);

							var span_13 = $.sibling(span_12, 2);
							var node_42 = $.sibling($.child(span_13));

							{
								let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.dark["foreground"]})`);

								ColorIndicator(node_42, {
									get color() {
										return $.get($0);
									}
								});
							}

							var text_23 = $.sibling(node_42);

							$.reset(span_13);

							var node_43 = $.sibling(span_13, 2);

							$.each(
								node_43,
								16,
								() => [
									"card",
									"popover",
									"primary",
									"secondary",
									"muted",
									"accent",
									"destructive"
								],
								(prefix) => prefix,
								($$anchor, prefix) => {
									$.next();

									var fragment_18 = root_6();
									var span_14 = $.sibling($.first_child(fragment_18));
									var text_24 = $.child(span_14);
									var node_44 = $.sibling(text_24);

									{
										let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.dark[prefix] || ""})`);

										ColorIndicator(node_44, {
											get color() {
												return $.get($0);
											}
										});
									}

									var text_25 = $.sibling(node_44);

									$.reset(span_14);

									var span_15 = $.sibling(span_14, 2);
									var text_26 = $.child(span_15);
									var node_45 = $.sibling(text_26);

									{
										let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.dark[`${prefix}-foreground`] || ""})`);

										ColorIndicator(node_45, {
											get color() {
												return $.get($0);
											}
										});
									}

									var text_27 = $.sibling(node_45);

									$.reset(span_15);
									$.next();

									$.template_effect(() => {
										$.set_text(text_24, `    --${prefix ?? ''}: `);
										$.set_text(text_25, ` ${$$props.activeTheme?.cssVars.dark[prefix] ?? ''};`);
										$.set_text(text_26, `    --${prefix ?? ''}-foreground: `);
										$.set_text(text_27, ` ${$$props.activeTheme?.cssVars.dark[`${prefix}-foreground`] ?? ''};`);
									});

									$.append($$anchor, fragment_18);
								}
							);

							var span_16 = $.sibling(node_43, 2);
							var node_46 = $.sibling($.child(span_16));

							{
								let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.dark["border"]})`);

								ColorIndicator(node_46, {
									get color() {
										return $.get($0);
									}
								});
							}

							var text_28 = $.sibling(node_46);

							$.reset(span_16);

							var span_17 = $.sibling(span_16, 2);
							var node_47 = $.sibling($.child(span_17));

							{
								let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.dark["input"]})`);

								ColorIndicator(node_47, {
									get color() {
										return $.get($0);
									}
								});
							}

							var text_29 = $.sibling(node_47);

							$.reset(span_17);

							var span_18 = $.sibling(span_17, 2);
							var node_48 = $.sibling($.child(span_18));

							{
								let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.dark["ring"]})`);

								ColorIndicator(node_48, {
									get color() {
										return $.get($0);
									}
								});
							}

							var text_30 = $.sibling(node_48);

							$.reset(span_18);

							var node_49 = $.sibling(span_18, 2);

							$.each(node_49, 16, () => ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"], (prefix) => prefix, ($$anchor, prefix) => {
								$.next();

								var fragment_19 = root_7();
								var span_19 = $.sibling($.first_child(fragment_19));
								var text_31 = $.child(span_19);
								var node_50 = $.sibling(text_31);

								{
									let $0 = $.derived(() => `hsl(${$$props.activeTheme?.cssVars.dark[prefix] || ""})`);

									ColorIndicator(node_50, {
										get color() {
											return $.get($0);
										}
									});
								}

								var text_32 = $.sibling(node_50);

								$.reset(span_19);
								$.next();

								$.template_effect(() => {
									$.set_text(text_31, `    --${prefix ?? ''}: `);
									$.set_text(text_32, ` ${$$props.activeTheme?.cssVars.dark[prefix] ?? ''};`);
								});

								$.append($$anchor, fragment_19);
							});

							$.next(5);
							$.reset(code_2);
							$.next();
							$.reset(pre_2);
							$.reset(figure_2);

							$.template_effect(() => {
								$.set_text(text_11, ` ${$$props.activeTheme?.cssVars.light["background"] ?? ''};`);
								$.set_text(text_12, ` ${$$props.activeTheme?.cssVars.light["foreground"] ?? ''};`);
								$.set_text(text_17, ` ${$$props.activeTheme?.cssVars.light["border"] ?? ''};`);
								$.set_text(text_18, ` ${$$props.activeTheme?.cssVars.light["input"] ?? ''};`);
								$.set_text(text_19, ` ${$$props.activeTheme?.cssVars.light["ring"] ?? ''};`);
								$.set_text(text_22, ` ${$$props.activeTheme?.cssVars.dark["background"] ?? ''};`);
								$.set_text(text_23, ` ${$$props.activeTheme?.cssVars.dark["foreground"] ?? ''};`);
								$.set_text(text_28, ` ${$$props.activeTheme?.cssVars.dark["border"] ?? ''};`);
								$.set_text(text_29, ` ${$$props.activeTheme?.cssVars.dark["input"] ?? ''};`);
								$.set_text(text_30, ` ${$$props.activeTheme?.cssVars.dark["ring"] ?? ''};`);
							});

							$.append($$anchor, figure_2);
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