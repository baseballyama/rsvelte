import * as $ from 'svelte/internal/server';
import Button from "$lib/buttons/Button.svelte";
import Tooltip from "$lib/tooltip/Tooltip.svelte";
import { DesktopPcOutline, MobilePhoneOutline, TabletOutline } from "flowbite-svelte-icons";
import { mount, onMount } from "svelte";
import { twJoin, twMerge } from "tailwind-merge";
import ExampleDarkMode from "./ExampleDarkMode.svelte";
import ExampleHelper from "./ExampleHelper.svelte";
import ExampleRtl from "./ExampleRTL.svelte";
import GitHub from "./icons/GitHub.svelte";

export default function ExampleWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Define the props properly with TypeScript
		// New prop for string code
		function normalizeIndentation(code) {
			if (!code) return code;

			const lines = code.split("\n");

			while (lines.length && lines[0].trim() === "") {
				lines.shift();
			}

			while (lines.length && lines[lines.length - 1].trim() === "") {
				lines.pop();
			}

			if (!lines.length) return "";

			const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

			const indentations = nonEmptyLines.map((line) => {
				const match = line.match(/^(\s*)/);

				return match ? match[1].length : 0;
			});

			const minIndent = Math.min(...indentations);

			const trimmedLines = lines.map((line) => line.trim() === ""
				? ""
				: line.length >= minIndent ? line.slice(minIndent) : line);

			return trimmedLines.join("\n").trim(); // ← Fix: Add .trim() here
		}

		// Action to normalize rendered code content
		function normalizeRenderedCode(node) {
			// Wait for the content to be rendered
			setTimeout(
				() => {
					if (!codeString && node.textContent) {
						const normalized = normalizeIndentation(node.textContent);

						if (normalized !== node.textContent) {
							node.textContent = normalized;
						}
					}
				},
				0
			);
		}

		// Use typed props
		let {
			meta = {
				hideOutput: false,
				hideSource: false,
				hideResponsiveButtons: false
			},
			example,
			code,
			codeString = undefined, // New prop
			divClass = "relative w-full mx-auto bg-linear-to-r p-5 bg-white dark:bg-gray-900"
		} = $$props;

		// State variables
		let browserSupport = false;

		let codeEl = undefined;
		let codeResponsiveContent = undefined;
		let path = undefined;
		let showExpandButton = false;
		let expand = false;
		let dark = false;
		let independentDarkMode = false;
		let independentDark = false;
		let rtl = "auto";
		let responsiveDevice = "desktop";
		let iframe = undefined;
		let iframeLoad = false;
		let copy_text = "Copy";
		let documentObserver = undefined;
		const responsiveSize = { mobile: "max-w-sm", tablet: "max-w-lg", desktop: "" };
		const gitHub = new URL("https://github.com/themesberg/flowbite-svelte/blob/main/src/routes/");

		function checkDarkMode() {
			if (document && document.documentElement) {
				const isDark = document.documentElement.classList.contains("dark");

				if (independentDarkMode) {
					independentDarkMode = false;
					independentDark = false;
				}

				dark = isDark;
				syncIframeDarkMode();
			}
		}

		function syncIframeDarkMode() {
			if (iframe && iframe.contentDocument) {
				if (dark) {
					iframe.contentDocument.documentElement.classList.add("dark");
				} else {
					iframe.contentDocument.documentElement.classList.remove("dark");
				}
			}
		}

		function toggleDarkMode() {
			independentDarkMode = true;
			independentDark = !independentDark;
			dark = independentDark;
			syncIframeDarkMode();
		}

		function init(node) {
			browserSupport = !!window?.navigator?.clipboard;
			dark = document.documentElement.classList.contains("dark");

			documentObserver = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.attributeName === "class") {
						checkDarkMode();
					}
				});
			});

			documentObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
			setTimeout(() => find_sections(node), 0);

			return {
				destroy() {
					if (documentObserver) {
						documentObserver.disconnect();
					}
				}
			};
		}

		function find_sections(node) {
			const sections = [
				...node.ownerDocument.querySelectorAll("#mainContent > :where(h2, h3) > [id]")
			];

			const sectionData = sections.map((x) => ({
				id: x.id,
				top: x.parentElement?.offsetTop ?? Infinity,
				obj: x
			}));

			const filteredSections = sectionData.filter((x) => x.top < (node?.offsetTop ?? Infinity)).filter((x) => x.id);
			const section = filteredSections.slice(-1).shift();

			if (section) {
				const pathname = new URL(node.baseURI).pathname;

				path = new URL(pathname.slice(1) + ".md", gitHub);
				path.hash = section.id.replaceAll("_", "-").replaceAll("/", "").toLowerCase();
			}
		}

		const copyToClipboard = async (e) => {
			if (!codeEl) return;

			let textToCopy;

			// Use codeString if available, otherwise fall back to innerText
			if (codeString) {
				textToCopy = normalizeIndentation(codeString);
			} else {
				const REG_HEX = /&#x([a-fA-F0-9]+);/g;

				textToCopy = codeEl.innerText.replace(REG_HEX, function (_match, group1) {
					const num = parseInt(group1, 16);

					return String.fromCharCode(num);
				});
			}

			if (window?.navigator?.clipboard) {
				await window.navigator.clipboard.writeText(textToCopy);
			}

			const button = e.target;

			button?.blur();

			const lastChild = button?.lastChild;

			if (lastChild) {
				lastChild.textContent = "Copied";
				setTimeout(() => lastChild.textContent = "Copy", 3000);
			}
		};

		function checkOverflow(el) {
			const isOverflowingY = el.clientHeight < el.scrollHeight;

			showExpandButton = isOverflowingY;
			el.firstElementChild?.classList.add("-mb-8");
		}

		const injectContent = () => {
			if (!iframe) return;
			if (!iframe.contentDocument) return;
			if (!iframe.contentWindow) return;

			iframeLoad = true;

			const externalCss = document.querySelectorAll('head link[href*="https://"][rel="stylesheet"], head style');
			const internalCss = Array.from(document.styleSheets).filter((el) => el.href?.includes(document.location.hostname));

			const extractInlineCss = internalCss.reduce(
				(acc, el) => {
					acc += Array.from(el.cssRules).map((rule) => rule.cssText).join(" ");

					return acc;
				},
				""
			);

			const styleTag = document.createElement("style");

			styleTag.innerHTML = extractInlineCss;

			const headContent = Array.from(externalCss).reduce((acc, el) => acc += el.outerHTML, "");

			iframe.contentDocument.head.insertAdjacentHTML("beforeend", `${headContent}${styleTag.outerHTML}` || "");

			mount(ExampleHelper, {
				target: iframe.contentDocument.body,
				props: {
					snippet: example,
					class: twMerge(divClass, meta?.class ?? "")
				}
			});

			syncIframeDarkMode();
			updateHeightContent();

			if (iframe.contentDocument?.body.firstChild) {
				const resizeObserver = new ResizeObserver(updateHeightContent);

				resizeObserver.observe(iframe.contentDocument.body.firstElementChild);
			}
		};

		const updateHeightContent = () => {
			if (!codeResponsiveContent) return;
			if (!iframe?.contentDocument?.body?.firstElementChild) return;

			const element = iframe.contentDocument.body.firstElementChild;
			const height = element.offsetHeight || 0;

			codeResponsiveContent.style.height = `${height}px`;
		};

		onMount(() => {
			dark = document.documentElement.classList.contains("dark");

			setTimeout(
				() => {
					if (iframe && !iframeLoad) {
						iframe.dispatchEvent(new Event("load"));
					}
				},
				500
			);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="code-example my-8">`);

			if (!meta?.hideOutput) {
				$$renderer.push(`<!--[0--><div class="w-full rounded-t-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"><div${$.attr_class(`grid ${meta.hideResponsiveButtons ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`)}>`);

				if (path) {
					$$renderer.push('<!--[0-->');

					Button($$renderer, {
						size: 'xs',
						color: 'alternative',
						class: 'hover:text-primary-600 w-fit gap-2 dark:bg-gray-900',
						href: "" + path,
						target: '_blank',
						rel: 'noreferrer',
						children: ($$renderer) => {
							GitHub($$renderer, { size: 'sm' });
							$$renderer.push(`<!---->Edit on GitHub`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (!meta?.hideResponsiveButtons) {
						$$renderer.push(`<!--[0--><div class="hidden justify-center gap-x-2 sm:flex">`);

						Button($$renderer, {
							size: 'xs',
							color: 'alternative',
							class: 'dark:bg-gray-900',
							onclick: () => responsiveDevice = "desktop",
							children: ($$renderer) => {
								DesktopPcOutline($$renderer, { size: 'sm' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							size: 'xs',
							color: 'alternative',
							class: 'dark:bg-gray-900',
							onclick: () => responsiveDevice = "tablet",
							children: ($$renderer) => {
								TabletOutline($$renderer, { size: 'sm' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							size: 'xs',
							color: 'alternative',
							class: 'dark:bg-gray-900',
							onclick: () => responsiveDevice = "mobile",
							children: ($$renderer) => {
								MobilePhoneOutline($$renderer, { size: 'sm' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="ms-auto flex">`);
					ExampleDarkMode($$renderer, { onclick: () => toggleDarkMode(), dark });
					$$renderer.push(`<!----> `);

					ExampleRtl($$renderer, {
						get rtl() {
							return rtl;
						},

						set rtl($$value) {
							rtl = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> <div class="code-preview-wrapper"><div${$.attr_class('code-preview flex border-x border-gray-200 bg-white bg-linear-to-r p-0 dark:border-gray-600 dark:bg-gray-900', void 0, { 'dark': dark })}${$.attr('dir', rtl)}><div class="code-responsive-wrapper w-full"><div${$.attr_class(`code-responive-content ${$.stringify(twJoin(!meta.hideResponsiveButtons && 'mx-auto', responsiveSize[responsiveDevice]))}`)}>`);

				if (!meta.hideResponsiveButtons) {
					$$renderer.push(`<!--[0--><iframe class="h-full w-full" title="iframe-code-content" onload="this.__e=event"></iframe>`);
				} else {
					$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(twMerge(divClass, meta.class)))}>`);
					example($$renderer);
					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!meta?.hideSource) {
				$$renderer.push(`<!--[0--><div class="code-syntax-wrapper"><div class="code-syntax relative border-x border-y border-gray-200 dark:border-gray-600"><div class="grid w-full grid-cols-2 rounded-t-md border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"><ul class="flex text-center text-sm font-medium text-gray-500 dark:text-gray-400"><li><span class="inline-block w-full border-e border-gray-200 bg-gray-100 p-2 px-3 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white">Svelte</span></li></ul> <div class="flex justify-end">`);

				if (browserSupport) {
					$$renderer.push(`<!--[0--><button type="button" class="hover:text-primary-700 copy-to-clipboard-button flex items-center border-s border-gray-200 bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white"><svg class="me-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Copy</button> `);

					Tooltip($$renderer, {
						placement: 'bottom-end',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Copy to clipboard.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div> <div class="relative"><div${$.attr_class('overflow-hidden', void 0, { 'max-h-72': !expand })} tabindex="-1"><div class="highlight"><pre class="language-svelte -mt-2! rounded-none!">`);

				if (codeString) {
					$$renderer.push(`<!--[0--><code>${$.escape(normalizeIndentation(codeString))}</code>`);
				} else {
					$$renderer.push('<!--[-1-->');
					code?.($$renderer);
					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]--></pre></div></div> `);

				if (showExpandButton && !expand) {
					$$renderer.push(`<!--[0--><button data-expand-code="" type="button" class="hover:text-primary-700 absolute start-0 bottom-0 w-full border-t border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Expand code</button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}