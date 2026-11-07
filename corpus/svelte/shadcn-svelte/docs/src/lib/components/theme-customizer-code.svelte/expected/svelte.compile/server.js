import * as $ from 'svelte/internal/server';
import CheckIcon from "@tabler/icons-svelte/icons/check";
import CopyIcon from "@tabler/icons-svelte/icons/copy";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import ColorIndicator from "./color-indicator.svelte";
import Css from "./icons/css.svelte";
import { getThemeCodeOKLCH, getThemeCodeHSLV4, getThemeCode } from "./theme-customizer.svelte";

export default function Theme_customizer_code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			tailwindVersion,
			hasCopied,
			copyToClipboard,
			activeTheme,
			activeThemeOKLCH
		} = $$props;

		if (Tabs.Root) {
			$$renderer.push('<!--[-->');

			Tabs.Root($$renderer, {
				value: tailwindVersion,
				onValueChange: (v) => tailwindVersion = v,
				class: 'min-w-0 px-4 pb-4 md:p-0',
				children: ($$renderer) => {
					if (Tabs.List) {
						$$renderer.push('<!--[-->');

						Tabs.List($$renderer, {
							children: ($$renderer) => {
								if (Tabs.Trigger) {
									$$renderer.push('<!--[-->');

									Tabs.Trigger($$renderer, {
										value: 'v4-oklch',
										children: ($$renderer) => {
											$$renderer.push(`<!---->OKLCH`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Tabs.Trigger) {
									$$renderer.push('<!--[-->');

									Tabs.Trigger($$renderer, {
										value: 'v4-hsl',
										children: ($$renderer) => {
											$$renderer.push(`<!---->HSL`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Tabs.Trigger) {
									$$renderer.push('<!--[-->');

									Tabs.Trigger($$renderer, {
										value: 'v3',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Tailwind v3`);
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

					if (Tabs.Content) {
						$$renderer.push('<!--[-->');

						Tabs.Content($$renderer, {
							value: 'v4-oklch',
							children: ($$renderer) => {
								$$renderer.push(`<figure data-rehype-pretty-code-figure="" class="mx-0! mt-0 rounded-lg"><figcaption class="flex items-center gap-2 text-code-foreground [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70" data-rehype-pretty-code-title="" data-language="css" data-theme="github-dark github-light-default">`);
								Css($$renderer, { class: 'fill-foreground' });

								$$renderer.push(`<!----> app/globals.css</figcaption> <pre class="no-scrollbar max-h-[300px] min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-data-highlighted-line:px-0 has-data-line-numbers:px-0 has-data-[slot=tabs]:p-0 md:max-h-[450px]">
				`);

								Button($$renderer, {
									'data-slot': 'copy-button',
									size: 'icon',
									variant: 'ghost',
									class: 'absolute top-3 right-2 z-10 size-7 bg-code text-code-foreground shadow-none hover:opacity-100 focus-visible:opacity-100',
									onclick: () => {
										copyToClipboard(getThemeCodeOKLCH(activeThemeOKLCH, 0.65));
									},

									children: ($$renderer) => {
										$$renderer.push(`<!---->
					<span class="sr-only">Copy</span>
					`);

										if (hasCopied) {
											$$renderer.push(`<!--[0-->
						`);

											CheckIcon($$renderer, {});

											$$renderer.push(`<!---->
					`);
										} else {
											$$renderer.push(`<!--[-1-->
						`);

											CopyIcon($$renderer, {});

											$$renderer.push(`<!---->
					`);
										}

										$$renderer.push(`<!--]-->
				`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->
				<code data-line-numbers="" data-language="css" class="-my-10">
					<span data-line="" class="line text-code-foreground"> :root {</span>
					<span data-line="" class="line text-code-foreground">   --radius: 0.65rem;</span>
					<!--[-->`);

								const each_array = $.ensure_array_like(Object.entries(activeThemeOKLCH?.light || {}));

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let [key, value] = each_array[$$index];

									$$renderer.push(`<!---->
						<span data-line="" class="line text-code-foreground">   --${$.escape(key)}: `);

									ColorIndicator($$renderer, { color: value });

									$$renderer.push(`<!----> ${$.escape(value)};</span>
					`);
								}

								$$renderer.push(`<!--]-->
					<span data-line="" class="line text-code-foreground"> }</span>
					<span data-line="" class="line text-code-foreground"> </span>
					<span data-line="" class="line text-code-foreground"> .dark {</span>
					<!--[-->`);

								const each_array_1 = $.ensure_array_like(Object.entries(activeThemeOKLCH?.dark || {}));

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let [key, value] = each_array_1[$$index_1];

									$$renderer.push(`<!---->
						<span data-line="" class="line text-code-foreground">   --${$.escape(key)}: `);

									ColorIndicator($$renderer, { color: value });

									$$renderer.push(`<!----> ${$.escape(value)};</span>
					`);
								}

								$$renderer.push(`<!--]-->
					<span data-line="" class="line text-code-foreground"> }</span>
				</code>
			</pre></figure>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Tabs.Content) {
						$$renderer.push('<!--[-->');

						Tabs.Content($$renderer, {
							value: 'v4-hsl',
							children: ($$renderer) => {
								$$renderer.push(`<figure data-rehype-pretty-code-figure="" class="mx-0! mt-0 rounded-lg"><figcaption class="flex items-center gap-2 text-code-foreground [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70" data-rehype-pretty-code-title="" data-language="css" data-theme="github-dark github-light-default">`);
								Css($$renderer, { class: 'fill-foreground' });

								$$renderer.push(`<!----> app/globals.css</figcaption> <pre class="no-scrollbar max-h-[300px] min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-data-highlighted-line:px-0 has-data-line-numbers:px-0 has-data-[slot=tabs]:p-0 md:max-h-[450px]">
				`);

								Button($$renderer, {
									'data-slot': 'copy-button',
									size: 'icon',
									variant: 'ghost',
									class: 'absolute top-3 right-2 z-10 size-7 bg-code text-code-foreground shadow-none hover:opacity-100 focus-visible:opacity-100',
									onclick: () => {
										copyToClipboard(getThemeCodeHSLV4(activeTheme, 0.65));
									},

									children: ($$renderer) => {
										$$renderer.push(`<!---->
					<span class="sr-only" data-llm-ignore="">Copy</span>
					`);

										if (hasCopied) {
											$$renderer.push(`<!--[0-->
						`);

											CheckIcon($$renderer, {});

											$$renderer.push(`<!---->
					`);
										} else {
											$$renderer.push(`<!--[-1-->
						`);

											CopyIcon($$renderer, {});

											$$renderer.push(`<!---->
					`);
										}

										$$renderer.push(`<!--]-->
				`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->
				<code data-line-numbers="" data-language="css" class="-my-10">
					<span data-line="" class="line text-code-foreground"> :root {</span>
					<span data-line="" class="line text-code-foreground">   --radius: 0.65rem;</span>
					<!--[-->`);

								const each_array_2 = $.ensure_array_like(Object.entries(activeTheme?.cssVars.light || {}));

								for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
									let [key, value] = each_array_2[$$index_2];

									$$renderer.push(`<!---->
						<span data-line="" class="line text-code-foreground">   --${$.escape(key)}: `);

									ColorIndicator($$renderer, { color: `hsl(${value})` });

									$$renderer.push(`<!----> hsl(${$.escape(value)});</span>
					`);
								}

								$$renderer.push(`<!--]-->
					<span data-line="" class="line text-code-foreground"> }</span>
					<span data-line="" class="line text-code-foreground"> </span>
					<span data-line="" class="line text-code-foreground"> .dark {</span>
					<!--[-->`);

								const each_array_3 = $.ensure_array_like(Object.entries(activeTheme?.cssVars.dark || {}));

								for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
									let [key, value] = each_array_3[$$index_3];

									$$renderer.push(`<!---->
						<span data-line="" class="line text-code-foreground">   --${$.escape(key)}: `);

									ColorIndicator($$renderer, { color: `hsl(${value})` });

									$$renderer.push(`<!----> hsl(${$.escape(value)});</span>
					`);
								}

								$$renderer.push(`<!--]-->
					<span data-line="" class="line text-code-foreground"> }</span>
				</code>
			</pre></figure>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Tabs.Content) {
						$$renderer.push('<!--[-->');

						Tabs.Content($$renderer, {
							value: 'v3',
							children: ($$renderer) => {
								$$renderer.push(`<figure data-rehype-pretty-code-figure="" class="mx-0! mt-0 rounded-lg"><figcaption class="flex items-center gap-2 text-code-foreground [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70" data-rehype-pretty-code-title="" data-language="css" data-theme="github-dark github-light-default">`);
								Css($$renderer, { class: 'fill-foreground' });

								$$renderer.push(`<!----> app/globals.css</figcaption> <pre class="no-scrollbar max-h-[300px] min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-data-highlighted-line:px-0 has-data-line-numbers:px-0 has-data-[slot=tabs]:p-0 md:max-h-[450px]">
				`);

								Button($$renderer, {
									'data-slot': 'copy-button',
									size: 'icon',
									variant: 'ghost',
									class: 'absolute top-3 right-2 z-10 size-7 bg-code text-code-foreground shadow-none hover:opacity-100 focus-visible:opacity-100',
									onclick: () => {
										copyToClipboard(getThemeCode(activeTheme, 0.5));
									},

									children: ($$renderer) => {
										$$renderer.push(`<!---->
					<span class="sr-only">Copy</span>
					`);

										if (hasCopied) {
											$$renderer.push(`<!--[0-->
						`);

											CheckIcon($$renderer, {});

											$$renderer.push(`<!---->
					`);
										} else {
											$$renderer.push(`<!--[-1-->
						`);

											CopyIcon($$renderer, {});

											$$renderer.push(`<!---->
					`);
										}

										$$renderer.push(`<!--]-->
				`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->
				<code data-line-numbers="" data-language="css" class="-my-10">
					<span data-line="" class="line">@layer base {</span>
					<span data-line="" class="line">  :root {</span>
					<span data-line="" class="line">    --background: `);

								ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.light["background"]})` });

								$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.light["background"])};</span>
					<span data-line="" class="line">    --foreground: `);

								ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.light["foreground"]})` });

								$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.light["foreground"])};</span>
					<!--[-->`);

								const each_array_4 = $.ensure_array_like([
									"card",
									"popover",
									"primary",
									"secondary",
									"muted",
									"accent",
									"destructive"
								]);

								for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
									let prefix = each_array_4[$$index_4];

									$$renderer.push(`<!---->
						<span data-line="" class="line">    --${$.escape(prefix)}: `);

									ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.light[prefix] || ""})` });

									$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.light[prefix])};</span>
						<span data-line="" class="line">    --${$.escape(prefix)}-foreground: `);

									ColorIndicator($$renderer, {
										color: `hsl(${activeTheme?.cssVars.light[`${prefix}-foreground`] || ""})`
									});

									$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.light[`${prefix}-foreground`])};</span>
					`);
								}

								$$renderer.push(`<!--]-->
					<span data-line="" class="line">    --border: `);

								ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.light["border"]})` });

								$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.light["border"])};</span>
					<span data-line="" class="line">    --input: `);

								ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.light["input"]})` });

								$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.light["input"])};</span>
					<span data-line="" class="line">    --ring: `);

								ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.light["ring"]})` });

								$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.light["ring"])};</span>
					<span data-line="" class="line">    --radius: 0.5rem;</span>
					<!--[-->`);

								const each_array_5 = $.ensure_array_like(["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]);

								for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
									let prefix = each_array_5[$$index_5];

									$$renderer.push(`<!---->
						<span data-line="" class="line">    --${$.escape(prefix)}: `);

									ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.light[prefix] || ""})` });

									$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.light[prefix])};</span>
					`);
								}

								$$renderer.push(`<!--]-->
					<span data-line="" class="line">  }</span>
					<span data-line="" class="line"> </span>
					<span data-line="" class="line">  .dark {</span>
					<span data-line="" class="line">    --background: `);

								ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.dark["background"]})` });

								$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.dark["background"])};</span>
					<span data-line="" class="line">    --foreground: `);

								ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.dark["foreground"]})` });

								$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.dark["foreground"])};</span>
					<!--[-->`);

								const each_array_6 = $.ensure_array_like([
									"card",
									"popover",
									"primary",
									"secondary",
									"muted",
									"accent",
									"destructive"
								]);

								for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
									let prefix = each_array_6[$$index_6];

									$$renderer.push(`<!---->
						<span data-line="" class="line">    --${$.escape(prefix)}: `);

									ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.dark[prefix] || ""})` });

									$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.dark[prefix])};</span>
						<span data-line="" class="line">    --${$.escape(prefix)}-foreground: `);

									ColorIndicator($$renderer, {
										color: `hsl(${activeTheme?.cssVars.dark[`${prefix}-foreground`] || ""})`
									});

									$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.dark[`${prefix}-foreground`])};</span>
					`);
								}

								$$renderer.push(`<!--]-->
					<span data-line="" class="line">    --border: `);

								ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.dark["border"]})` });

								$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.dark["border"])};</span>
					<span data-line="" class="line">    --input: `);

								ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.dark["input"]})` });

								$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.dark["input"])};</span>
					<span data-line="" class="line">    --ring: `);

								ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.dark["ring"]})` });

								$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.dark["ring"])};</span>
					<!--[-->`);

								const each_array_7 = $.ensure_array_like(["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]);

								for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
									let prefix = each_array_7[$$index_7];

									$$renderer.push(`<!---->
						<span data-line="" class="line">    --${$.escape(prefix)}: `);

									ColorIndicator($$renderer, { color: `hsl(${activeTheme?.cssVars.dark[prefix] || ""})` });

									$$renderer.push(`<!----> ${$.escape(activeTheme?.cssVars.dark[prefix])};</span>
					`);
								}

								$$renderer.push(`<!--]-->
					<span data-line="" class="line">  }</span>
					<span data-line="" class="line">}</span>
				</code>
			</pre></figure>`);
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
	});
}