import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

var root = $.from_html(`<div>Loading related links...</div>`);
var root_1 = $.from_html(`<span><button> </button></span>`);
var root_2 = $.from_html(`<p> </p>`);
var root_3 = $.from_html(`<li><a> </a> <!></li>`);
var root_4 = $.from_html(`<section><!> <ul></ul></section>`);

export default function Seealso($$anchor, $$props) {
	$.push($$props, true);

	let links = $.prop($$props, 'links', 19, () => []),
		showDescriptions = $.prop($$props, 'showDescriptions', 3, true),
		className = $.prop($$props, 'class', 3, "");

	let expanded = $.state(false);
	let processedLinks = $.state($.proxy([]));
	let loading = $.state(true);

	function toggleExpanded() {
		$.set(expanded, !$.get(expanded));
	}

	const seeAlso = tv({
		slots: {
			base: "my-8 p-4 rounded border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800",
			span: "text-xl font-semibold mb-3 flex justify-between items-center dark:text-white",
			toggleButton: "text-sm text-blue-500 bg-transparent border-none cursor-pointer underline p-0",
			list: "list-none p-0 m-0",
			item: "mb-3 last:mb-0",
			linkcls: "text-blue-500 no-underline font-medium hover:underline hover:text-primary-700",
			description: "text-sm text-gray-500 dark:text-gray-400 mt-1 m-0"
		}
	});

	const { base, span, toggleButton, list, item, linkcls, description } = seeAlso();
	const modules = import.meta.glob("../docs/**/*.md", { query: "?raw", import: "default" });

	function extractFrontmatter(content) {
		const match = content.match(/^---\s*\n([\s\S]*?)\n---/);

		if (!match || !match[1]) return null;

		const frontmatter = {};
		const lines = match[1].split("\n");

		for (const line of lines) {
			const colonIndex = line.indexOf(":");

			if (colonIndex > 0) {
				const key = line.slice(0, colonIndex).trim();
				let value = line.slice(colonIndex + 1).trim();

				value = value.replace(/^['"](.*)['"]$/, "$1");

				if (value) frontmatter[key] = value;
			}
		}

		return frontmatter;
	}

	async function processUrlArray(urlList) {
		return await Promise.all(urlList.map(async (url) => {
			let filePath = url.startsWith("/") ? url.substring(1) : url;

			if (!filePath.endsWith(".md")) filePath += ".md";

			const fullPath = `../${filePath}`;
			const loader = modules[fullPath];

			if (loader) {
				try {
					const raw = await loader();
					const frontmatter = extractFrontmatter(raw);
					const desc = frontmatter?.description || "";

					return {
						title: frontmatter?.component_title || frontmatter?.title || url,
						url,
						description: desc.length > 100 ? `${desc.slice(0, 100)}...` : desc
					};
				} catch(e) {
					console.error(`Error loading ${fullPath}`, e);
				}
			}

			const fallbackTitle = url.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || url;

			return { title: fallbackTitle, url };
		}));
	}

	onMount(async () => {
		$.set(processedLinks, await processUrlArray(links()), true);
		$.set(loading, false);
	});

	let visibleLinks = $.derived(() => $.get(expanded)
		? $.get(processedLinks)
		: $.get(processedLinks).slice(0, 3));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(base())]);
			$.append($$anchor, div);
		};

		var consequent_3 = ($$anchor) => {
			var section = root_4();
			var node_1 = $.child(section);

			{
				var consequent_1 = ($$anchor) => {
					var span_1 = root_1();
					var button = $.child(span_1);
					var text = $.only_child(button, true);

					$.reset(span_1);

					$.template_effect(
						($0, $1) => {
							$.set_class(span_1, 1, $0);
							$.set_class(button, 1, $1);
							$.set_attribute(button, 'aria-expanded', $.get(expanded));

							$.set_text(text, $.get(expanded)
								? "Show less"
								: `Show all (${$.get(processedLinks).length})`);
						},
						[() => $.clsx(span()), () => $.clsx(toggleButton())]
					);

					$.delegated('click', button, toggleExpanded);
					$.append($$anchor, span_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(processedLinks).length > 3) $$render(consequent_1);
				});
			}

			var ul = $.sibling(node_1, 2);

			$.each(ul, 21, () => $.get(visibleLinks), (link) => link.url, ($$anchor, link) => {
				var li = root_3();
				var a = $.child(li);
				var text_1 = $.only_child(a, true);
				var node_2 = $.sibling(a, 2);

				{
					var consequent_2 = ($$anchor) => {
						var p = root_2();
						var text_2 = $.only_child(p, true);

						$.template_effect(
							($0) => {
								$.set_class(p, 1, $0);
								$.set_text(text_2, $.get(link).description);
							},
							[() => $.clsx(description())]
						);

						$.append($$anchor, p);
					};

					$.if(node_2, ($$render) => {
						if (showDescriptions() && $.get(link).description) $$render(consequent_2);
					});
				}

				$.reset(li);

				$.template_effect(
					($0, $1) => {
						$.set_class(li, 1, $0);
						$.set_attribute(a, 'href', $.get(link).url);
						$.set_class(a, 1, $1);
						$.set_text(text_1, $.get(link).title);
					},
					[() => $.clsx(item()), () => $.clsx(linkcls())]
				);

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(section);

			$.template_effect(
				($0, $1) => {
					$.set_class(section, 1, $0);
					$.set_class(ul, 1, $1);
				},
				[
					() => $.clsx(twMerge(base(), className())),
					() => $.clsx(list())
				]
			);

			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if ($.get(processedLinks).length > 0) $$render(consequent_3, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);