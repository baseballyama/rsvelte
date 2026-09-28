import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";
import Tooltip from "$lib/tooltip/Tooltip.svelte";
import { DesktopPcOutline, MobilePhoneOutline, TabletOutline } from "flowbite-svelte-icons";
import { mount, onMount } from "svelte";
import { twJoin, twMerge } from "tailwind-merge";
import ExampleDarkMode from "./ExampleDarkMode.svelte";
import ExampleHelper from "./ExampleHelper.svelte";
import ExampleRtl from "./ExampleRTL.svelte";
import GitHub from "./icons/GitHub.svelte";

var root = $.from_html(`<!>Edit on GitHub`, 1);
var root_1 = $.from_html(`<div class="hidden justify-center gap-x-2 sm:flex"><!> <!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <div class="ms-auto flex"><!> <!></div>`, 1);
var root_3 = $.from_html(`<iframe class="h-full w-full" title="iframe-code-content"></iframe>`);
var root_4 = $.from_html(`<div><!></div>`);
var root_5 = $.from_html(`<div class="w-full rounded-t-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"><div><!></div></div> <div class="code-preview-wrapper"><div><div class="code-responsive-wrapper w-full"><div><!></div></div></div></div>`, 1);
var root_6 = $.from_html(`<button type="button" class="hover:text-primary-700 copy-to-clipboard-button flex items-center border-s border-gray-200 bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white"><svg class="me-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> </button> <!>`, 1);
var root_7 = $.from_html(`<code> </code>`);
var root_8 = $.from_html(`<button data-expand-code="" type="button" class="hover:text-primary-700 absolute start-0 bottom-0 w-full border-t border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Expand code</button>`);
var root_9 = $.from_html(`<div class="code-syntax-wrapper"><div class="code-syntax relative border-x border-y border-gray-200 dark:border-gray-600"><div class="grid w-full grid-cols-2 rounded-t-md border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"><ul class="flex text-center text-sm font-medium text-gray-500 dark:text-gray-400"><li><span class="inline-block w-full border-e border-gray-200 bg-gray-100 p-2 px-3 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white">Svelte</span></li></ul> <div class="flex justify-end"><!></div></div> <div class="relative"><div tabindex="-1"><div class="highlight"><pre class="language-svelte -mt-2! rounded-none!"><!></pre></div></div> <!></div></div></div>`);
var root_10 = $.from_html(`<div class="code-example my-8"><!> <!></div>`);

export default function ExampleWrapper($$anchor, $$props) {
	$.push($$props, true);

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
				if (!codeString() && node.textContent) {
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
	let meta = $.prop($$props, 'meta', 19, () => ({
			hideOutput: false,
			hideSource: false,
			hideResponsiveButtons: false
		})),
		codeString = $.prop($$props, 'codeString', 3, undefined // New prop
		),
		divClass = $.prop($$props, 'divClass', 3, "relative w-full mx-auto bg-linear-to-r p-5 bg-white dark:bg-gray-900");

	// State variables
	let browserSupport = $.state(false);

	let codeEl = $.state(undefined);
	let codeResponsiveContent = $.state(undefined);
	let path = $.state(undefined);
	let showExpandButton = $.state(false);
	let expand = $.state(false);
	let dark = $.state(false);
	let independentDarkMode = $.state(false);
	let independentDark = $.state(false);
	let rtl = $.state("auto");
	let responsiveDevice = $.state("desktop");
	let iframe = $.state(undefined);
	let iframeLoad = $.state(false);
	let copy_text = "Copy";
	let documentObserver = $.state(undefined);
	const responsiveSize = { mobile: "max-w-sm", tablet: "max-w-lg", desktop: "" };
	const gitHub = new URL("https://github.com/themesberg/flowbite-svelte/blob/main/src/routes/");

	function checkDarkMode() {
		if (document && document.documentElement) {
			const isDark = document.documentElement.classList.contains("dark");

			if ($.get(independentDarkMode)) {
				$.set(independentDarkMode, false);
				$.set(independentDark, false);
			}

			$.set(dark, isDark, true);
			syncIframeDarkMode();
		}
	}

	function syncIframeDarkMode() {
		if ($.get(iframe) && $.get(iframe).contentDocument) {
			if ($.get(dark)) {
				$.get(iframe).contentDocument.documentElement.classList.add("dark");
			} else {
				$.get(iframe).contentDocument.documentElement.classList.remove("dark");
			}
		}
	}

	function toggleDarkMode() {
		$.set(independentDarkMode, true);
		$.set(independentDark, !$.get(independentDark));
		$.set(dark, $.get(independentDark), true);
		syncIframeDarkMode();
	}

	function init(node) {
		$.set(browserSupport, !!window?.navigator?.clipboard);
		$.set(dark, document.documentElement.classList.contains("dark"), true);

		$.set(
			documentObserver,
			new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.attributeName === "class") {
						checkDarkMode();
					}
				});
			}),
			true
		);

		$.get(documentObserver).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
		setTimeout(() => find_sections(node), 0);

		return {
			destroy() {
				if ($.get(documentObserver)) {
					$.get(documentObserver).disconnect();
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

			$.set(path, new URL(pathname.slice(1) + ".md", gitHub), true);
			$.get(path).hash = section.id.replaceAll("_", "-").replaceAll("/", "").toLowerCase();
		}
	}

	const copyToClipboard = async (e) => {
		if (!$.get(codeEl)) return;

		let textToCopy;

		// Use codeString if available, otherwise fall back to innerText
		if (codeString()) {
			textToCopy = normalizeIndentation(codeString());
		} else {
			const REG_HEX = /&#x([a-fA-F0-9]+);/g;

			textToCopy = $.get(codeEl).innerText.replace(REG_HEX, function (_match, group1) {
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

		$.set(showExpandButton, isOverflowingY);
		el.firstElementChild?.classList.add("-mb-8");
	}

	const injectContent = () => {
		if (!$.get(iframe)) return;
		if (!$.get(iframe).contentDocument) return;
		if (!$.get(iframe).contentWindow) return;

		$.set(iframeLoad, true);

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

		$.get(iframe).contentDocument.head.insertAdjacentHTML("beforeend", `${headContent}${styleTag.outerHTML}` || "");

		mount(ExampleHelper, {
			target: $.get(iframe).contentDocument.body,
			props: {
				snippet: $$props.example,
				class: twMerge(divClass(), meta()?.class ?? "")
			}
		});

		syncIframeDarkMode();
		updateHeightContent();

		if ($.get(iframe).contentDocument?.body.firstChild) {
			const resizeObserver = new ResizeObserver(updateHeightContent);

			resizeObserver.observe($.get(iframe).contentDocument.body.firstElementChild);
		}
	};

	const updateHeightContent = () => {
		if (!$.get(codeResponsiveContent)) return;
		if (!$.get(iframe)?.contentDocument?.body?.firstElementChild) return;

		const element = $.get(iframe).contentDocument.body.firstElementChild;
		const height = element.offsetHeight || 0;

		$.get(codeResponsiveContent).style.height = `${height}px`;
	};

	onMount(() => {
		$.set(dark, document.documentElement.classList.contains("dark"), true);

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
		if (!$.get(iframe)) return;
		if (!$.get(iframe).contentDocument) return;

		$.get(iframe).contentDocument.documentElement.dir = $.get(rtl) || "";
	});

	var div = root_10();
	var node_1 = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = root_5();
			var div_1 = $.first_child(fragment);
			var div_2 = $.child(div_1);
			var node_2 = $.child(div_2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_1 = root_2();
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
								var fragment_2 = root();
								var node_4 = $.first_child(fragment_2);

								GitHub(node_4, { size: 'sm' });
								$.next();
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					}

					var node_5 = $.sibling(node_3, 2);

					{
						var consequent = ($$anchor) => {
							var div_3 = root_1();
							var node_6 = $.child(div_3);

							Button(node_6, {
								size: 'xs',
								color: 'alternative',
								class: 'dark:bg-gray-900',
								onclick: () => $.set(responsiveDevice, "desktop"),
								children: ($$anchor, $$slotProps) => {
									DesktopPcOutline($$anchor, { size: 'sm' });
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Button(node_7, {
								size: 'xs',
								color: 'alternative',
								class: 'dark:bg-gray-900',
								onclick: () => $.set(responsiveDevice, "tablet"),
								children: ($$anchor, $$slotProps) => {
									TabletOutline($$anchor, { size: 'sm' });
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							Button(node_8, {
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

						$.if(node_5, ($$render) => {
							if (!meta()?.hideResponsiveButtons) $$render(consequent);
						});
					}

					var div_4 = $.sibling(node_5, 2);
					var node_9 = $.child(div_4);

					ExampleDarkMode(node_9, {
						onclick: () => toggleDarkMode(),
						get dark() {
							return $.get(dark);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					ExampleRtl(node_10, {
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
			var node_11 = $.child(div_8);

			{
				var consequent_2 = ($$anchor) => {
					var iframe_1 = root_3();

					$.bind_this(iframe_1, ($$value) => $.set(iframe, $$value), () => $.get(iframe));
					$.event('load', iframe_1, injectContent);
					$.replay_events(iframe_1);
					$.append($$anchor, iframe_1);
				};

				var alternate = ($$anchor) => {
					var div_9 = root_4();
					var node_12 = $.child(div_9);

					$.snippet(node_12, () => $$props.example);
					$.reset(div_9);
					$.template_effect(($0) => $.set_class(div_9, 1, $0), [() => $.clsx(twMerge(divClass(), meta().class))]);
					$.append($$anchor, div_9);
				};

				$.if(node_11, ($$render) => {
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
			if (!meta()?.hideOutput) $$render(consequent_3);
		});
	}

	var node_13 = $.sibling(node_1, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_10 = root_9();
			var div_11 = $.child(div_10);
			var div_12 = $.child(div_11);
			var div_13 = $.sibling($.child(div_12), 2);
			var node_14 = $.child(div_13);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_6 = root_6();
					var button_1 = $.first_child(fragment_6);
					var text = $.sibling($.child(button_1));

					text.nodeValue = ' Copy';
					$.reset(button_1);

					var node_15 = $.sibling(button_1, 2);

					Tooltip(node_15, {
						placement: 'bottom-end',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Copy to clipboard.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.delegated('click', button_1, (e) => copyToClipboard(e));
					$.append($$anchor, fragment_6);
				};

				$.if(node_14, ($$render) => {
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
			var node_16 = $.child(pre);

			{
				var consequent_5 = ($$anchor) => {
					var code_1 = root_7();
					var text_2 = $.only_child(code_1, true);

					$.template_effect(($0) => $.set_text(text_2, $0), [() => normalizeIndentation(codeString())]);
					$.append($$anchor, code_1);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_7 = $.comment();
					var node_17 = $.first_child(fragment_7);

					$.snippet(node_17, () => $$props.code ?? $.noop);
					$.append($$anchor, fragment_7);
				};

				$.if(node_16, ($$render) => {
					if (codeString()) $$render(consequent_5); else $$render(alternate_1, -1);
				});
			}

			$.reset(pre);
			$.bind_this(pre, ($$value) => $.set(codeEl, $$value), () => $.get(codeEl));
			$.action(pre, ($$node) => normalizeRenderedCode?.($$node));
			$.reset(div_16);
			$.reset(div_15);
			$.action(div_15, ($$node) => checkOverflow?.($$node));

			var node_18 = $.sibling(div_15, 2);

			{
				var consequent_6 = ($$anchor) => {
					var button_2 = root_8();

					$.delegated('click', button_2, () => $.set(expand, !$.get(expand)));
					$.append($$anchor, button_2);
				};

				$.if(node_18, ($$render) => {
					if ($.get(showExpandButton) && !$.get(expand)) $$render(consequent_6);
				});
			}

			$.reset(div_14);
			$.reset(div_11);
			$.reset(div_10);
			$.template_effect(() => classes_1 = $.set_class(div_15, 1, 'overflow-hidden', null, classes_1, { 'max-h-72': !$.get(expand) }));
			$.append($$anchor, div_10);
		};

		$.if(node_13, ($$render) => {
			if (!meta()?.hideSource) $$render(consequent_7);
		});
	}

	$.reset(div);
	$.action(div, ($$node) => init?.($$node));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);