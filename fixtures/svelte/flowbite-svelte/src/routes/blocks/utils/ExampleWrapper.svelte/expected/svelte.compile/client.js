import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Tooltip } from "flowbite-svelte";
import { DesktopPcOutline, MobilePhoneOutline, TabletOutline } from "flowbite-svelte-icons";
import { mount, onMount } from "svelte";
import { twJoin, twMerge } from "tailwind-merge";
import ExampleDarkMode from "./ExampleDarkMode.svelte";
import ExampleHelper from "./ExampleHelper.svelte";
import ExampleRtl from "./ExampleRTL.svelte";

var root = $.from_html(`<div class="hidden justify-center gap-x-2 sm:flex"><!> <!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <div class="ms-auto flex"><!> <!></div>`, 1);
var root_2 = $.from_html(`<iframe class="h-full w-full" title="iframe-code-content"></iframe>`);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<div class="w-full rounded-t-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"><div><!></div></div> <div class="code-preview-wrapper"><div><div class="code-responsive-wrapper w-full"><div><!></div></div></div></div>`, 1);
var root_5 = $.from_html(`<button type="button" class="hover:text-primary-700 copy-to-clipboard-button flex items-center border-s border-gray-200 bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white"><svg class="me-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> </button> <!>`, 1);
var root_6 = $.from_html(`<button data-expand-code="" type="button" class="hover:text-primary-700 absolute start-0 bottom-0 w-full border-t border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Expand code</button>`);
var root_7 = $.from_html(`<div class="code-syntax-wrapper"><div class="code-syntax relative border-x border-y border-gray-200 dark:border-gray-600"><div class="grid w-full grid-cols-2 rounded-t-md border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"><ul class="flex text-center text-sm font-medium text-gray-500 dark:text-gray-400"><li><span class="inline-block w-full border-e border-gray-200 bg-gray-100 p-2 px-3 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white">Svelte</span></li></ul> <div class="flex justify-end"><!></div></div> <div class="relative"><div tabindex="-1"><div class="highlight"><pre class="language-svelte -mt-2! rounded-none!"><!></pre></div></div> <!></div></div></div>`);
var root_8 = $.from_html(`<div class="code-example mt-8"><!> <!></div>`);

export default function ExampleWrapper($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * I removed the iFrames. They where used for resizing. I'm not sure they still needed.
	 */
	// import { GitHub } from '$lib';
	let src = $.prop($$props, 'src', 3, undefined),
		meta = $.prop($$props, 'meta', 3, undefined),
		divClass = $.prop($$props, 'divClass', 3, "relative w-full mx-auto bg-linear-to-r bg-white dark:bg-gray-900 p-5");

	// suppress vite-plugin-svelte warning about unused props by using them in $effect
	$.user_effect(() => {
		// the source of the example, if you want it
		src();

		// all meta tags of the code block
		meta();
	});

	/* eslint-disable  @typescript-eslint/no-explicit-any */
	let browserSupport = $.state(false);

	let codeEl = $.state(void 0);
	let codeResponsiveContent = $.state(void 0);

	// https://github.com/themesberg/flowbite-svelte/blob/main/src/routes/docs/components/accordion.md#always-open
	const gitHub = new URL("https://github.com/shinokada/flowbite-svelte-blocks/blob/main/src/routes/");

	let path = $.state(void 0);
	let showExpandButton = $.state(false);
	let expand = $.state(false);
	let dark = $.state(false);
	let rtl = $.state("auto");
	let responsiveDevice = $.state("desktop");
	const responsiveSize = { mobile: "max-w-sm", tablet: "max-w-lg", desktop: "" };

	function updateDarkMode(ev) {
		const target = ev.target,
			isDark = target.ownerDocument.documentElement.classList.contains("dark");

		$.set(dark, isDark, true);
	}

	function init(node) {
		$.set(browserSupport, !!window?.navigator?.clipboard);

		const button = node.ownerDocument.querySelector('button[aria-label="Dark mode"]');

		button?.addEventListener("click", updateDarkMode);
		$.set(dark, node.ownerDocument.documentElement.classList.contains("dark"), true);
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

			$.set(path, new URL(pathname.slice(1) + ".md", gitHub), true);
			$.get(path).hash = section.id.replaceAll("_", "-").replaceAll("/", "").toLowerCase();
		}
	}

	const copyToClipboard = async (e) => {
		const REG_HEX = /&#x([a-fA-F0-9]+);/g;

		const decodedText = $.get(codeEl)?.innerText.replace(REG_HEX, function (_match, group1) {
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

		$.set(showExpandButton, isOverflowingY);
		el.firstElementChild?.classList.add("-mb-8");
	}

	let copy_text = "Copy";

	// iFrame support
	let iframe = $.state(void 0);

	let iframeLoad = $.state(false);

	const injectContent = () => {
		if (!$.get(iframe)?.contentDocument) return;
		if (!$.get(iframe)?.contentWindow) return;

		$.set(iframeLoad, true);

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
		$.get(iframe).contentDocument.head.insertAdjacentHTML("beforeend", `${headContent}${styleTag.outerHTML}` || "");

		// mount component
		mount(ExampleHelper, {
			target: $.get(iframe).contentDocument.body,
			props: {
				snippet: $$props.example,
				class: twMerge(divClass(), meta().class)
			}
		});

		updateHeightContent();

		// listen change on height of the iframe content and update the preview height
		if ($.get(iframe).contentDocument?.body.firstChild) {
			const resizeObserver = new ResizeObserver(updateHeightContent);

			resizeObserver.observe($.get(iframe).contentDocument.body.firstElementChild);
		}

		$.set(iframe, $.get(iframe), true);
	};

	const updateHeightContent = () => {
		if ($.get(codeResponsiveContent)) {
			$.get(codeResponsiveContent).style.height = `${($.get(iframe)?.contentDocument?.body?.firstElementChild)?.offsetHeight || 0}px`;
		}
	};

	onMount(() => {
		// workaround for svelte issue https://github.com/sveltejs/svelte/issues/6967
		setTimeout(
			() => {
				if ($.get(iframe) && !$.get(iframeLoad)) {
					$.get(iframe).dispatchEvent(new Event("load"));
				}
			},
			500
		);
	});

	$.user_effect(() => {
		if ($.get(iframe)) {
			// toggle dark mode class in the iframe
			$.get(dark)
				? $.get(iframe)?.contentDocument?.documentElement.classList.add("dark")
				: $.get(iframe)?.contentDocument?.documentElement.classList.remove("dark");
		}
	});

	$.user_effect(() => {
		if ($.get(iframe) && $.get(iframe).contentDocument) {
			// toggle dir value in the iframe
			$.get(iframe).contentDocument.documentElement.dir = $.get(rtl) ?? "";
		}
	});

	var div = root_8();
	var node_1 = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = root_4();
			var div_1 = $.first_child(fragment);
			var div_2 = $.child(div_1);
			var node_2 = $.child(div_2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_1 = root_1();
					var node_3 = $.first_child(fragment_1);

					{
						let $0 = $.derived(() => "" + $.get(path));

						Button(node_3, {
							size: 'xs',
							color: 'alternative',
							class: 'hover:text-primary-600 w-fit gap-2 dark:bg-gray-900',
							get href() {
								return $.get($0);
							},
							target: '_blank',
							rel: 'noreferrer',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Edit on GitHub');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent = ($$anchor) => {
							var div_3 = root();
							var node_5 = $.child(div_3);

							Button(node_5, {
								size: 'xs',
								color: 'alternative',
								class: 'dark:bg-gray-900',
								onclick: () => $.set(responsiveDevice, "desktop"),
								children: ($$anchor, $$slotProps) => {
									DesktopPcOutline($$anchor, { size: 'sm' });
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Button(node_6, {
								size: 'xs',
								color: 'alternative',
								class: 'dark:bg-gray-900',
								onclick: () => $.set(responsiveDevice, "tablet"),
								children: ($$anchor, $$slotProps) => {
									TabletOutline($$anchor, { size: 'sm' });
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Button(node_7, {
								size: 'xs',
								color: 'alternative',
								class: 'dark:bg-gray-900',
								onclick: () => $.set(responsiveDevice, "mobile"),
								children: ($$anchor, $$slotProps) => {
									MobilePhoneOutline($$anchor, { size: 'sm' });
								},
								$$slots: { default: true }
							});

							$.reset(div_3);
							$.append($$anchor, div_3);
						};

						$.if(node_4, ($$render) => {
							if (!meta().hideResponsiveButtons) $$render(consequent);
						});
					}

					var div_4 = $.sibling(node_4, 2);
					var node_8 = $.child(div_4);

					ExampleDarkMode(node_8, {
						onclick: () => $.set(dark, !$.get(dark)),
						get dark() {
							return $.get(dark);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					ExampleRtl(node_9, {
						get rtl() {
							return $.get(rtl);
						},

						set rtl($$value) {
							$.set(rtl, $$value, true);
						}
					});

					$.reset(div_4);
					$.append($$anchor, fragment_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(path)) $$render(consequent_1);
				});
			}

			$.reset(div_2);
			$.reset(div_1);

			var div_5 = $.sibling(div_1, 2);
			var div_6 = $.child(div_5);
			let classes;
			var div_7 = $.child(div_6);
			var div_8 = $.child(div_7);
			var node_10 = $.child(div_8);

			{
				var consequent_2 = ($$anchor) => {
					var iframe_1 = root_2();

					$.bind_this(iframe_1, ($$value) => $.set(iframe, $$value), () => $.get(iframe));
					$.event('load', iframe_1, injectContent);
					$.replay_events(iframe_1);
					$.append($$anchor, iframe_1);
				};

				var alternate = ($$anchor) => {
					var div_9 = root_3();
					var node_11 = $.child(div_9);

					$.snippet(node_11, () => $$props.example);
					$.reset(div_9);
					$.template_effect(($0) => $.set_class(div_9, 1, $0), [() => $.clsx(twMerge(divClass(), meta().class))]);
					$.append($$anchor, div_9);
				};

				$.if(node_10, ($$render) => {
					if (!meta().hideResponsiveButtons) $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			$.reset(div_8);
			$.bind_this(div_8, ($$value) => $.set(codeResponsiveContent, $$value), () => $.get(codeResponsiveContent));
			$.reset(div_7);
			$.reset(div_6);
			$.reset(div_5);

			$.template_effect(
				($0) => {
					$.set_class(div_2, 1, `grid ${meta().hideResponsiveButtons ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`);
					classes = $.set_class(div_6, 1, 'code-preview flex border-x border-gray-200 bg-white bg-linear-to-r p-0 dark:border-gray-600 dark:bg-gray-900', null, classes, { dark: $.get(dark) });
					$.set_attribute(div_6, 'dir', $.get(rtl));
					$.set_class(div_8, 1, `code-responive-content ${$0 ?? ''}`);
					div_6.dir = div_6.dir;
				},
				[
					() => twJoin(!meta().hideResponsiveButtons && 'mx-auto', responsiveSize[$.get(responsiveDevice)])
				]
			);

			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if (!meta().hideOutput) $$render(consequent_3);
		});
	}

	var node_12 = $.sibling(node_1, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_10 = root_7();
			var div_11 = $.child(div_10);
			var div_12 = $.child(div_11);
			var div_13 = $.sibling($.child(div_12), 2);
			var node_13 = $.child(div_13);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_5 = root_5();
					var button_1 = $.first_child(fragment_5);
					var text_1 = $.sibling($.child(button_1));

					text_1.nodeValue = ' Copy';
					$.reset(button_1);

					var node_14 = $.sibling(button_1, 2);

					Tooltip(node_14, {
						placement: 'bottom-end',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Copy to clipboard.');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.delegated('click', button_1, (e) => copyToClipboard(e));
					$.append($$anchor, fragment_5);
				};

				$.if(node_13, ($$render) => {
					if ($.get(browserSupport)) $$render(consequent_4);
				});
			}

			$.reset(div_13);
			$.reset(div_12);

			var div_14 = $.sibling(div_12, 2);
			var div_15 = $.child(div_14);
			let classes_1;
			var div_16 = $.child(div_15);
			var pre = $.child(div_16);
			var node_15 = $.child(pre);

			$.snippet(node_15, () => $$props.code ?? $.noop);
			$.reset(pre);
			$.bind_this(pre, ($$value) => $.set(codeEl, $$value), () => $.get(codeEl));
			$.reset(div_16);
			$.reset(div_15);
			$.action(div_15, ($$node) => checkOverflow?.($$node));

			var node_16 = $.sibling(div_15, 2);

			{
				var consequent_5 = ($$anchor) => {
					var button_2 = root_6();

					$.delegated('click', button_2, () => $.set(expand, !$.get(expand)));
					$.append($$anchor, button_2);
				};

				$.if(node_16, ($$render) => {
					if ($.get(showExpandButton) && !$.get(expand)) $$render(consequent_5);
				});
			}

			$.reset(div_14);
			$.reset(div_11);
			$.reset(div_10);
			$.template_effect(() => classes_1 = $.set_class(div_15, 1, 'overflow-hidden', null, classes_1, { 'max-h-72': !$.get(expand) }));
			$.append($$anchor, div_10);
		};

		$.if(node_12, ($$render) => {
			if (!meta().hideSource) $$render(consequent_6);
		});
	}

	$.reset(div);
	$.action(div, ($$node) => init?.($$node));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);