import * as $ from 'svelte/internal/server';
import Motion from "@components/motion.svelte";
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Tree } from "melt/builders";
import JavaScript from "~icons/devicon/javascript";
import Svelte from "~icons/devicon/svelte";
import Folder from "~icons/ph/folder-fill";
import FolderOpen from "~icons/ph/folder-open-fill";

function treeItemIcon($$renderer, item) {
	const icon = item.item.icon;

	if (icon === "folder") {
		$$renderer.push('<!--[0-->');

		if (item.expanded ? FolderOpen : Folder) {
			$$renderer.push('<!--[-->');
			(item.expanded ? FolderOpen : Folder)($$renderer, { role: 'presentation' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	} else if (icon === "svelte") {
		$$renderer.push('<!--[1-->');
		Svelte($$renderer, { role: 'presentation' });
	} else if (icon === "js") {
		$$renderer.push('<!--[2-->');
		JavaScript($$renderer, { role: 'presentation' });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}

function button($$renderer, props) {
	$$renderer.push(`<button class="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800 transition-all hover:cursor-pointer hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50">${$.escape(props.text)}</button>`);
}

export default function Tree_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const controls = usePreviewControls({
			multiple: { type: "boolean", defaultValue: true, label: "Multiple" },
			expandOnClick: {
				type: "boolean",
				defaultValue: true,
				label: "Expand on click"
			}
		});

		const data = [
			{ id: "index.svelte", title: "index.svelte", icon: "svelte" },
			{
				id: "lib",
				title: "lib",
				icon: "folder",
				children: [
					{
						id: "lib/icons",
						title: "icons",
						icon: "folder",
						children: [
							{
								id: "lib/icons/JavaScript.svelte",
								title: "JavaScript.svelte",
								icon: "svelte"
							},

							{
								id: "lib/icons/Svelte.svelte",
								title: "Svelte.svelte",
								icon: "svelte"
							}
						]
					},

					{
						id: "lib/tree",
						title: "tree",
						icon: "folder",
						children: [
							{
								id: "lib/tree/Tree.svelte",
								title: "Tree.svelte",
								icon: "svelte"
							},

							{
								id: "lib/tree/TreeItem.svelte",
								title: "TreeItem.svelte",
								icon: "svelte"
							}
						]
					}
				]
			},

			{
				id: "routes",
				title: "routes",
				icon: "folder",
				children: [
					{
						id: "routes/contents",
						title: "contents",
						icon: "folder",
						children: [
							{
								id: "routes/contents/+layout.svelte",
								title: "+layout.svelte",
								icon: "svelte"
							},

							{
								id: "routes/contents/+page.svelte",
								title: "+page.svelte",
								icon: "svelte"
							}
						]
					}
				]
			}
		];

		const tree = new Tree({
			items: data,
			expanded: ["lib", "routes"],
			...getters(controls)
		});

		function treeItems($$renderer, items, depth = 0) {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<li${$.attributes({
					...item.attrs,
					class: 'cursor-pointer rounded-sm !outline-none first:mt-0 [&amp;:focus-visible>:first-child>div]:ring-4'
				})}><div class="group py-1"${$.attr_style(`padding-left: ${$.stringify(depth * 1)}rem`)}><div${$.attr_class(`${item.selected
					? '!bg-accent-500 dark:!bg-accent-200 dark:!text-accent-950 !text-white'
					: ''} ring-accent-500 dark:ring-accent-700 flex h-full w-full items-center gap-2 rounded-xl px-3 py-1 ring-offset-white transition group-hover:bg-gray-200 dark:ring-offset-black dark:group-hover:bg-gray-800`)}>`);

				treeItemIcon($$renderer, item);
				$$renderer.push(`<!----> <span class="select-none">${$.escape(item.item.title)}</span></div></div> `);

				if (item.children?.length) {
					$$renderer.push('<!--[0-->');

					Motion($$renderer, $.spread_props([
						{
							tag: 'ul',
							animate: {
								height: item.expanded ? "auto" : 0,
								opacity: item.expanded ? 1 : 0,
								scale: item.expanded ? 1 : 0.85
							},
							transition: {
								height: { delay: item.expanded ? 0 : 0.1 },
								opacity: {
									ease: "easeOut",
									delay: item.expanded ? 0.1 : 0,
									duration: 0.2
								},
								type: "spring",
								stiffness: 200,
								damping: 20,
								mass: 0.15,
								bounce: 1
							}
						},
						tree.group,
						{
							class: `relative list-none p-0 ${!item.expanded ? 'pointer-events-none' : ''} origin-left`,
							children: ($$renderer) => {
								$$renderer.push(`<div class="absolute bottom-2 top-2 w-px bg-gray-200 dark:bg-gray-700"${$.attr_style(`left: ${$.stringify(0.5 + depth * 1)}rem`)}></div> `);
								treeItems($$renderer, item.children, depth + 1);
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						}
					]));
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></li>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		Preview($$renderer, {
			class: '!py-6',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center justify-center gap-2">`);
				button($$renderer, { onclick: tree.collapseAll, text: "Collapse All" });
				$$renderer.push(`<!----> `);
				button($$renderer, { onclick: tree.expandAll, text: "Expand All" });

				$$renderer.push(`<!----></div> <ul${$.attributes({
					class: 'mx-auto w-[300px] list-none rounded-md p-4',
					...tree.root
				})}>`);

				treeItems($$renderer, tree.children, 0);
				$$renderer.push(`<!----></ul>`);
			},
			$$slots: { default: true }
		});
	});
}