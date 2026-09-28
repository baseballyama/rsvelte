import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

export default function Seealso($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { links = [], showDescriptions = true, class: className = "" } = $$props;
		let expanded = false;
		let processedLinks = [];
		let loading = true;

		function toggleExpanded() {
			expanded = !expanded;
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
			processedLinks = await processUrlArray(links);
			loading = false;
		});

		let visibleLinks = $.derived(() => expanded ? processedLinks : processedLinks.slice(0, 3));

		if (loading) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(base()))}>Loading related links...</div>`);
		} else if (processedLinks.length > 0) {
			$$renderer.push(`<!--[1--><section${$.attr_class($.clsx(twMerge(base(), className)))}>`);

			if (processedLinks.length > 3) {
				$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(span()))}><button${$.attr_class($.clsx(toggleButton()))}${$.attr('aria-expanded', expanded)}>${$.escape(expanded ? "Show less" : `Show all (${processedLinks.length})`)}</button></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <ul${$.attr_class($.clsx(list()))}><!--[-->`);

			const each_array = $.ensure_array_like(visibleLinks());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let link = each_array[$$index];

				$$renderer.push(`<li${$.attr_class($.clsx(item()))}><a${$.attr('href', link.url)}${$.attr_class($.clsx(linkcls()))}>${$.escape(link.title)}</a> `);

				if (showDescriptions && link.description) {
					$$renderer.push(`<!--[0--><p${$.attr_class($.clsx(description()))}>${$.escape(link.description)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></li>`);
			}

			$$renderer.push(`<!--]--></ul></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}