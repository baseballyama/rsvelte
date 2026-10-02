import * as $ from 'svelte/internal/server';
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

export default function Theme_customizer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...rest } = $$props;
		const userConfig = UserConfigContext.get();
		const THEMES = baseColors.filter((theme) => !["slate", "stone", "gray", "zinc"].includes(theme.name)).sort((a, b) => a.name.localeCompare(b.name));
		const coercedActiveTheme = $.derived(() => userConfig.current.activeTheme === "default" ? "neutral" : userConfig.current.activeTheme);

		// Code customizer state
		let hasCopied = false;

		let tailwindVersion = "v4-oklch";
		const activeTheme = $.derived(() => baseColors.find((theme) => theme.name === coercedActiveTheme()));
		const activeThemeOKLCH = $.derived(() => baseColorsOKLCH[coercedActiveTheme()]);

		function copyToClipboard(text) {
			navigator.clipboard.writeText(text);
			hasCopied = true;

			setTimeout(
				() => {
					hasCopied = false;
				},
				2000
			);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			var bind_get = () => userConfig.current.activeTheme;

			var bind_set = (v) => {
				userConfig.setConfig({ activeTheme: v ?? "default" });
				setTheme(v ?? "default");
			};

			$$renderer.push(`<div${$.attributes({
				class: $.clsx(cn("flex w-full items-center gap-2", className)),
				...rest
			})}>`);

			ScrollArea($$renderer, {
				class: 'hidden max-w-[96%] md:max-w-[600px] lg:flex lg:max-w-none',
				orientation: 'both',
				scrollbarXClasses: 'invisible',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center"><!--[-->`);

					const each_array = $.ensure_array_like(THEMES);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let theme = each_array[$$index];

						Button($$renderer, {
							variant: 'link',
							size: 'sm',
							'data-active': coercedActiveTheme() === theme.name,
							class: 'flex h-7 cursor-pointer items-center justify-center px-4 text-center text-base font-medium text-muted-foreground capitalize transition-colors hover:text-primary hover:no-underline data-[active=true]:text-primary',
							onclick: () => {
								userConfig.setConfig({ activeTheme: theme.name });
								setTheme(theme.name);
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(theme.name === "neutral" ? "Default" : theme.name)}`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex items-center gap-2 lg:hidden">`);

			Label($$renderer, {
				for: 'theme-selector',
				class: 'sr-only',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Theme`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					allowDeselect: false,
					get value() {
						return bind_get();
					},

					set value($$value) {
						bind_set($$value);
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								id: 'theme-selector',
								size: 'sm',
								class: 'justify-start capitalize shadow-none *:data-[slot=select-value]:w-12 *:data-[slot=select-value]:capitalize',
								children: ($$renderer) => {
									$$renderer.push(`<span class="font-medium">Theme:</span> <span data-slot="select-value">${$.escape(coercedActiveTheme() ?? "Select a theme")}</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Content) {
							$$renderer.push('<!--[-->');

							Select.Content($$renderer, {
								align: 'end',
								children: ($$renderer) => {
									if (Select.Group) {
										$$renderer.push('<!--[-->');

										Select.Group($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_1 = $.ensure_array_like(THEMES);

												for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
													let theme = each_array_1[$$index_1];

													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: theme.name,
															class: 'capitalize data-selected:opacity-50',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(theme.name)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> `);

			if (Drawer.Root) {
				$$renderer.push('<!--[-->');

				Drawer.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ size: 'sm', variant: 'secondary' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Copy Code`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Drawer.Trigger) {
								$$renderer.push('<!--[-->');

								Drawer.Trigger($$renderer, {
									class: cn("sm:hidden!", "ms-auto"),
									child,
									$$slots: { child: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Drawer.Content) {
							$$renderer.push('<!--[-->');

							Drawer.Content($$renderer, {
								class: 'h-auto',
								children: ($$renderer) => {
									if (Drawer.Header) {
										$$renderer.push('<!--[-->');

										Drawer.Header($$renderer, {
											children: ($$renderer) => {
												if (Drawer.Title) {
													$$renderer.push('<!--[-->');

													Drawer.Title($$renderer, {
														class: 'capitalize',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(coercedActiveTheme() === "neutral" ? "Neutral" : coercedActiveTheme())}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Drawer.Description) {
													$$renderer.push('<!--[-->');

													Drawer.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Copy and paste the following code into your CSS file.`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									ThemeCustomizerCode($$renderer, {
										tailwindVersion,
										hasCopied,
										copyToClipboard,
										activeTheme: activeTheme(),
										activeThemeOKLCH: activeThemeOKLCH()
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ size: 'sm', class: 'ms-auto', variant: 'secondary' },
									props,
									{
										children: ($$renderer) => {
											IconCopy($$renderer, {});
											$$renderer.push(`<!----> <span class="group-data-[size=icon-sm]/button:sr-only">Copy Code</span>`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');

								Dialog.Trigger($$renderer, {
									class: cn("hidden sm:flex!", "ms-auto"),
									child,
									$$slots: { child: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'rounded-xl border-none bg-clip-padding shadow-2xl ring-4 ring-neutral-200/80 outline-none md:max-w-2xl dark:bg-neutral-800 dark:ring-neutral-900',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														class: 'capitalize',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(coercedActiveTheme() === "neutral" ? "Neutral" : coercedActiveTheme())}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Copy and paste the following code into your CSS file.`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									ThemeCustomizerCode($$renderer, {
										tailwindVersion,
										hasCopied,
										copyToClipboard,
										activeTheme: activeTheme(),
										activeThemeOKLCH: activeThemeOKLCH()
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}