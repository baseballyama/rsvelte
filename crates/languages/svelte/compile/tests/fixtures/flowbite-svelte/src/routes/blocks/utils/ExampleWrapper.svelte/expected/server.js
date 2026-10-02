import * as $ from 'svelte/internal/server';
import { Button, Tooltip } from "flowbite-svelte";
import { DesktopPcOutline, MobilePhoneOutline, TabletOutline } from "flowbite-svelte-icons";
import { mount, onMount } from "svelte";
import { twJoin, twMerge } from "tailwind-merge";
import ExampleDarkMode from "./ExampleDarkMode.svelte";
import ExampleHelper from "./ExampleHelper.svelte";
import ExampleRtl from "./ExampleRTL.svelte";

export default function ExampleWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * I removed the iFrames. They where used for resizing. I'm not sure they still needed.
		 */
		// import { GitHub } from '$lib';
		let {
			src = undefined,
			meta = undefined,
			example,
			code,
			divClass = "relative w-full mx-auto bg-linear-to-r bg-white dark:bg-gray-900 p-5"
		} = $$props;

		// suppress vite-plugin-svelte warning about unused props by using them in $effect
		// the source of the example, if you want it
		// all meta tags of the code block
		/* eslint-disable  @typescript-eslint/no-explicit-any */
		let browserSupport = false;

		let codeEl = void 0;
		let codeResponsiveContent = void 0;

		// https://github.com/themesberg/flowbite-svelte/blob/main/src/routes/docs/components/accordion.md#always-open
		const gitHub = new URL("https://github.com/shinokada/flowbite-svelte-blocks/blob/main/src/routes/");

		let path = void 0;
		let showExpandButton = false;
		let expand = false;
		let dark = false;
		let rtl = "auto";
		let responsiveDevice = "desktop";
		const responsiveSize = { mobile: "max-w-sm", tablet: "max-w-lg", desktop: "" };

		function updateDarkMode(ev) {
			const target = ev.target,
				isDark = target.ownerDocument.documentElement.classList.contains("dark");

			dark = isDark;
		}

		function init(node) {
			browserSupport = !!window?.navigator?.clipboard;

			const button = node.ownerDocument.querySelector('button[aria-label="Dark mode"]');

			button?.addEventListener("click", updateDarkMode);
			dark = node.ownerDocument.documentElement.classList.contains("dark");
			setTimeout(() => find_sections(node), 0);

			return {
				destroy() {
					button?.removeEventListener("click", updateDarkMode);
				}
			};
		}

		function find_sections(node) {
			// find closes previous section anchor
			const section = [
				...node.ownerDocument.querySelectorAll("#mainContent > :where(h2, h3) > [id]")
			].map((x) => ({
				id: x.id,
				top: x.parentElement?.offsetTop ?? Infinity,
				obj: x
			})).filter((x) => x.top < (node?.offsetTop ?? Infinity)).filter((x) => x.id).slice(-1).shift();

			// console.log('section:', section);
			if (section) {
				const pathname = new URL(node.baseURI).pathname;

				path = new URL(pathname.slice(1) + ".md", gitHub);
				path.hash = section.id.replaceAll("_", "-").replaceAll("/", "").toLowerCase();
			}
		}

		const copyToClipboard = async (e) => {
			const REG_HEX = /&#x([a-fA-F0-9]+);/g;

			const decodedText = codeEl?.innerText.replace(REG_HEX, function (_match, group1) {
				const num = parseInt(group1, 16);

				return String.fromCharCode(num);
			}) ?? "";

			await window.navigator.clipboard.writeText(decodedText);

			const button = e?.target;

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

		let copy_text = "Copy";

		// iFrame support
		let iframe = void 0;

		let iframeLoad = false;

		const injectContent = () => {
			if (!iframe?.contentDocument) return;
			if (!iframe?.contentWindow) return;

			iframeLoad = true;

			// get only css and style frome head
			const externalCss = document.querySelectorAll('head link[href*="https://"][rel="stylesheet"], head style');

			const internalCss = Array.from(document.styleSheets).filter((el) => el.href?.includes(document.location.hostname));

			// extract style to avoid multiple network request to css
			const extractInlineCss = internalCss.reduce(
				(acc, el) => {
					acc += Array.from(el.cssRules).map((rule) => rule.cssText).join(" ");

					return acc;
				},
				""
			);

			const styleTag = document.createElement("style");

			styleTag.innerHTML = extractInlineCss;

			// extract outerHtlm in order to clone html
			const headContent = Array.from(externalCss).reduce((acc, el) => acc += el.outerHTML, "");

			// put the content of head in the head of the iframe
			iframe.contentDocument.head.insertAdjacentHTML("beforeend", `${headContent}${styleTag.outerHTML}` || "");

			// mount component
			mount(ExampleHelper, {
				target: iframe.contentDocument.body,
				props: { snippet: example, class: twMerge(divClass, meta.class) }
			});

			updateHeightContent();

			// listen change on height of the iframe content and update the preview height
			if (iframe.contentDocument?.body.firstChild) {
				const resizeObserver = new ResizeObserver(updateHeightContent);

				resizeObserver.observe(iframe.contentDocument.body.firstElementChild);
			}

			iframe = iframe;
		};

		const updateHeightContent = () => {
			if (codeResponsiveContent) {
				codeResponsiveContent.style.height = `${(iframe?.contentDocument?.body?.firstElementChild)?.offsetHeight || 0}px`;
			}
		};

		onMount(() => {
			// workaround for svelte issue https://github.com/sveltejs/svelte/issues/6967
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
			$$renderer.push(`<div class="code-example mt-8">`);

			if (!meta.hideOutput) {
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
							$$renderer.push(`<!---->Edit on GitHub`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (!meta.hideResponsiveButtons) {
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
					ExampleDarkMode($$renderer, { onclick: () => dark = !dark, dark });
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

			if (!meta.hideSource) {
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
				code?.($$renderer);
				$$renderer.push(`<!----></pre></div></div> `);

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