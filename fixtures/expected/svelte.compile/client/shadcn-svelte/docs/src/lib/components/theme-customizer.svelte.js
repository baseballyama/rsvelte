import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconCopy from "@tabler/icons-svelte/icons/copy";
import { setTheme } from "mode-watcher";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { baseColors, baseColorsOKLCH } from "$lib/registry/registry-base-colors.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";
import { cn } from "$lib/utils.js";
import ThemeCustomizerCode from "./theme-customizer-code.svelte";

export function getThemeCodeOKLCH(theme, radius) {
	if (!theme) {
		return "";
	}

	const rootSection = ":root {\n  --radius: " + radius + "rem;\n" + Object.entries(theme.light).map((entry) => "  --" + entry[0] + ": " + entry[1] + ";").join("\n") + "\n}\n\n.dark {\n" + Object.entries(theme.dark).map((entry) => "  --" + entry[0] + ": " + entry[1] + ";").join("\n") + "\n}\n";

	return rootSection;
}

export function getThemeCodeHSLV4(theme, radius) {
	if (!theme) {
		return "";
	}

	const rootSection = ":root {\n  --radius: " + radius + "rem;\n" + Object.entries(theme.cssVars.light).map((entry) => "  --" + entry[0] + ": hsl(" + entry[1] + ");").join("\n") + "\n}\n\n.dark {\n" + Object.entries(theme.cssVars.dark).map((entry) => "  --" + entry[0] + ": hsl(" + entry[1] + ");").join("\n") + "\n}\n";

	return rootSection;
}

export function getThemeCode(theme, radius) {
	if (!theme) {
		return "";
	}

	const replaceTemplate = (str, obj) => {
		let result = str;

		for (const key in obj) {
			const pattern = new RegExp(`<%- ${key}\\[["']([^"']+)["']\\] %>`, "g");

			result = result.replace(pattern, (_, k) => {
				const value = obj[key];

				if (typeof value === "object" && typeof value[k] === "string") {
					return value[k] ?? "";
				}

				return "";
			});

			const simplePattern = new RegExp(`<%- ${key} %>`, "g");

			result = result.replace(simplePattern, String(obj[key]));
		}

		return result;
	};

	return replaceTemplate(BASE_STYLES_WITH_VARIABLES, { colors: theme.cssVars, radius: radius.toString() });
}

export const BASE_STYLES_WITH_VARIABLES = `
@layer base {
  :root {
    --background: <%- colors.light["background"] %>;
    --foreground: <%- colors.light["foreground"] %>;
    --card: <%- colors.light["card"] %>;
    --card-foreground: <%- colors.light["card-foreground"] %>;
    --popover: <%- colors.light["popover"] %>;
    --popover-foreground: <%- colors.light["popover-foreground"] %>;
    --primary: <%- colors.light["primary"] %>;
    --primary-foreground: <%- colors.light["primary-foreground"] %>;
    --secondary: <%- colors.light["secondary"] %>;
    --secondary-foreground: <%- colors.light["secondary-foreground"] %>;
    --muted: <%- colors.light["muted"] %>;
    --muted-foreground: <%- colors.light["muted-foreground"] %>;
    --accent: <%- colors.light["accent"] %>;
    --accent-foreground: <%- colors.light["accent-foreground"] %>;
    --destructive: <%- colors.light["destructive"] %>;
    --destructive-foreground: <%- colors.light["destructive-foreground"] %>;
    --border: <%- colors.light["border"] %>;
    --input: <%- colors.light["input"] %>;
    --ring: <%- colors.light["ring"] %>;
    --radius: <%- radius %>rem;
    --chart-1: <%- colors.light["chart-1"] %>;
    --chart-2: <%- colors.light["chart-2"] %>;
    --chart-3: <%- colors.light["chart-3"] %>;
    --chart-4: <%- colors.light["chart-4"] %>;
    --chart-5: <%- colors.light["chart-5"] %>;
  }

  .dark {
    --background: <%- colors.dark["background"] %>;
    --foreground: <%- colors.dark["foreground"] %>;
    --card: <%- colors.dark["card"] %>;
    --card-foreground: <%- colors.dark["card-foreground"] %>;
    --popover: <%- colors.dark["popover"] %>;
    --popover-foreground: <%- colors.dark["popover-foreground"] %>;
    --primary: <%- colors.dark["primary"] %>;
    --primary-foreground: <%- colors.dark["primary-foreground"] %>;
    --secondary: <%- colors.dark["secondary"] %>;
    --secondary-foreground: <%- colors.dark["secondary-foreground"] %>;
    --muted: <%- colors.dark["muted"] %>;
    --muted-foreground: <%- colors.dark["muted-foreground"] %>;
    --accent: <%- colors.dark["accent"] %>;
    --accent-foreground: <%- colors.dark["accent-foreground"] %>;
    --destructive: <%- colors.dark["destructive"] %>;
    --destructive-foreground: <%- colors.dark["destructive-foreground"] %>;
    --border: <%- colors.dark["border"] %>;
    --input: <%- colors.dark["input"] %>;
    --ring: <%- colors.dark["ring"] %>;
    --chart-1: <%- colors.dark["chart-1"] %>;
    --chart-2: <%- colors.dark["chart-2"] %>;
    --chart-3: <%- colors.dark["chart-3"] %>;
    --chart-4: <%- colors.dark["chart-4"] %>;
    --chart-5: <%- colors.dark["chart-5"] %>;
  }
}
`;

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<div class="flex items-center"></div>`);
var root_1 = $.from_html(`<span class="font-medium">Theme:</span> <span data-slot="select-value"> </span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <span class="group-data-[size=icon-sm]/button:sr-only">Copy Code</span>`, 1);
var root_4 = $.from_html(`<div><!> <div class="flex items-center gap-2 lg:hidden"><!> <!></div> <!> <!></div>`);

export default function Theme_customizer($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const userConfig = UserConfigContext.get();
	const THEMES = baseColors.filter((theme) => !["slate", "stone", "gray", "zinc"].includes(theme.name)).sort((a, b) => a.name.localeCompare(b.name));
	const coercedActiveTheme = $.derived(() => userConfig.current.activeTheme === "default" ? "neutral" : userConfig.current.activeTheme);

	// Code customizer state
	let hasCopied = $.state(false);

	let tailwindVersion = "v4-oklch";
	const activeTheme = $.derived(() => baseColors.find((theme) => theme.name === $.get(coercedActiveTheme)));
	const activeThemeOKLCH = $.derived(() => baseColorsOKLCH[$.get(coercedActiveTheme)]);

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
		$.set(hasCopied, true);

		setTimeout(
			() => {
				$.set(hasCopied, false);
			},
			2000
		);
	}

	var div = root_4();

	$.attribute_effect(div, ($0) => ({ class: $0, ...rest }), [() => cn("flex w-full items-center gap-2", $$props.class)]);

	var node = $.child(div);

	ScrollArea(node, {
		class: 'hidden max-w-[96%] md:max-w-[600px] lg:flex lg:max-w-none',
		orientation: 'both',
		scrollbarXClasses: 'invisible',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();

			$.each(div_1, 21, () => THEMES, (theme) => theme.name, ($$anchor, theme) => {
				{
					let $0 = $.derived(() => $.get(coercedActiveTheme) === $.get(theme).name);

					Button($$anchor, {
						variant: 'link',
						size: 'sm',
						get 'data-active'() {
							return $.get($0);
						},
						class: 'flex h-7 cursor-pointer items-center justify-center px-4 text-center text-base font-medium text-muted-foreground capitalize transition-colors hover:text-primary hover:no-underline data-[active=true]:text-primary',
						onclick: () => {
							userConfig.setConfig({ activeTheme: $.get(theme).name });
							setTheme($.get(theme).name);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(theme).name === "neutral" ? "Default" : $.get(theme).name));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	Label(node_1, {
		for: 'theme-selector',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Theme');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);
	var bind_get = () => userConfig.current.activeTheme;

	var bind_set = (v) => {
		userConfig.setConfig({ activeTheme: v ?? "default" });
		setTheme(v ?? "default");
	};

	$.component(node_2, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			allowDeselect: false,
			get value() {
				return bind_get();
			},

			set value($$value) {
				bind_set($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						id: 'theme-selector',
						size: 'sm',
						class: 'justify-start capitalize shadow-none *:data-[slot=select-value]:w-12 *:data-[slot=select-value]:capitalize',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var span = $.sibling($.first_child(fragment_3), 2);
							var text_3 = $.only_child(span, true);

							$.template_effect(() => $.set_text(text_3, $.get(coercedActiveTheme) ?? "Select a theme"));
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => Select.Group, ($$anchor, Select_Group) => {
								Select_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_6 = $.first_child(fragment_5);

										$.each(node_6, 17, () => THEMES, (theme) => theme.name, ($$anchor, theme) => {
											var fragment_6 = $.comment();
											var node_7 = $.first_child(fragment_6);

											$.component(node_7, () => Select.Item, ($$anchor, Select_Item) => {
												Select_Item($$anchor, {
													get value() {
														return $.get(theme).name;
													},
													class: 'capitalize data-selected:opacity-50',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text();

														$.template_effect(() => $.set_text(text_4, $.get(theme).name));
														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_6);
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);

	var node_8 = $.sibling(div_2, 2);

	$.component(node_8, () => Drawer.Root, ($$anchor, Drawer_Root) => {
		Drawer_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root_2();
				var node_9 = $.first_child(fragment_8);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props({ size: 'sm', variant: 'secondary' }, props, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Copy Code');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						}));
					};

					let $0 = $.derived(() => cn("sm:hidden!", "ms-auto"));

					$.component(node_9, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
						Drawer_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_10 = $.sibling(node_9, 2);

				$.component(node_10, () => Drawer.Content, ($$anchor, Drawer_Content) => {
					Drawer_Content($$anchor, {
						class: 'h-auto',
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_2();
							var node_11 = $.first_child(fragment_10);

							$.component(node_11, () => Drawer.Header, ($$anchor, Drawer_Header) => {
								Drawer_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_2();
										var node_12 = $.first_child(fragment_11);

										$.component(node_12, () => Drawer.Title, ($$anchor, Drawer_Title) => {
											Drawer_Title($$anchor, {
												class: 'capitalize',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text();

													$.template_effect(() => $.set_text(text_6, $.get(coercedActiveTheme) === "neutral" ? "Neutral" : $.get(coercedActiveTheme)));
													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_12, 2);

										$.component(node_13, () => Drawer.Description, ($$anchor, Drawer_Description) => {
											Drawer_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Copy and paste the following code into your CSS file.');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_11, 2);

							ThemeCustomizerCode(node_14, {
								tailwindVersion,
								get hasCopied() {
									return $.get(hasCopied);
								},
								copyToClipboard,
								get activeTheme() {
									return $.get(activeTheme);
								},

								get activeThemeOKLCH() {
									return $.get(activeThemeOKLCH);
								}
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});
	});

	var node_15 = $.sibling(node_8, 2);

	$.component(node_15, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_13 = root_2();
				var node_16 = $.first_child(fragment_13);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props({ size: 'sm', class: 'ms-auto', variant: 'secondary' }, props, {
							children: ($$anchor, $$slotProps) => {
								var fragment_15 = root_3();
								var node_17 = $.first_child(fragment_15);

								IconCopy(node_17, {});
								$.next(2);
								$.append($$anchor, fragment_15);
							},
							$$slots: { default: true }
						}));
					};

					let $0 = $.derived(() => cn("hidden sm:flex!", "ms-auto"));

					$.component(node_16, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_18 = $.sibling(node_16, 2);

				$.component(node_18, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'rounded-xl border-none bg-clip-padding shadow-2xl ring-4 ring-neutral-200/80 outline-none md:max-w-2xl dark:bg-neutral-800 dark:ring-neutral-900',
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_2();
							var node_19 = $.first_child(fragment_16);

							$.component(node_19, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_17 = root_2();
										var node_20 = $.first_child(fragment_17);

										$.component(node_20, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'capitalize',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text();

													$.template_effect(() => $.set_text(text_8, $.get(coercedActiveTheme) === "neutral" ? "Neutral" : $.get(coercedActiveTheme)));
													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_20, 2);

										$.component(node_21, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('Copy and paste the following code into your CSS file.');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_17);
									},
									$$slots: { default: true }
								});
							});

							var node_22 = $.sibling(node_19, 2);

							ThemeCustomizerCode(node_22, {
								tailwindVersion,
								get hasCopied() {
									return $.get(hasCopied);
								},
								copyToClipboard,
								get activeTheme() {
									return $.get(activeTheme);
								},

								get activeThemeOKLCH() {
									return $.get(activeThemeOKLCH);
								}
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_13);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}