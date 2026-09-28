import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Motion from "@components/motion.svelte";
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Tree } from "melt/builders";
import JavaScript from "~icons/devicon/javascript";
import Svelte from "~icons/devicon/svelte";
import Folder from "~icons/ph/folder-fill";
import FolderOpen from "~icons/ph/folder-open-fill";

const treeItemIcon = ($$anchor, item = $.noop) => {
	const icon = $.derived(() => item().item.icon);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => item().expanded ? FolderOpen : Folder, ($$anchor, $$component) => {
				$$component($$anchor, { role: 'presentation' });
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_1 = ($$anchor) => {
			Svelte($$anchor, { role: 'presentation' });
		};

		var consequent_2 = ($$anchor) => {
			JavaScript($$anchor, { role: 'presentation' });
		};

		$.if(node, ($$render) => {
			if ($.get(icon) === "folder") $$render(consequent); else if ($.get(icon) === "svelte") $$render(consequent_1, 1); else if ($.get(icon) === "js") $$render(consequent_2, 2);
		});
	}

	$.append($$anchor, fragment);
};

const button = ($$anchor, props = $.noop) => {
	var button_1 = root_2();
	var text_1 = $.only_child(button_1, true);

	$.template_effect(() => $.set_text(text_1, props().text));

	$.delegated('click', button_1, function (...$$args) {
		props().onclick?.apply(this, $$args);
	});

	$.append($$anchor, button_1);
};

var root = $.from_html(`<div class="absolute bottom-2 top-2 w-px bg-gray-200 dark:bg-gray-700"></div> <!>`, 1);
var root_1 = $.from_html(`<li><div class="group py-1"><div><!> <span class="select-none"> </span></div></div> <!></li>`);

var root_2 = $.from_html(`<button class="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800
			transition-all hover:cursor-pointer hover:bg-gray-200
			active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50
			dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50"> </button>`);

var root_3 = $.from_html(`<div class="flex items-center justify-center gap-2"><!> <!></div> <ul><!></ul>`, 1);

export default function Tree_1($$anchor, $$props) {
	$.push($$props, true);

	const treeItems = ($$anchor, items = $.noop, $$arg1) => {
		let depth = $.derived_safe_equal(() => $.fallback($$arg1?.(), 0));
		var fragment_4 = $.comment();
		var node_2 = $.first_child(fragment_4);

		$.each(node_2, 17, items, (item) => item.id, ($$anchor, item) => {
			var li = root_1();

			$.attribute_effect(li, () => ({
				...$.get(item).attrs,
				class: 'cursor-pointer rounded-sm !outline-none first:mt-0 [&:focus-visible>:first-child>div]:ring-4'
			}));

			var div = $.child(li);
			var div_1 = $.child(div);
			var node_3 = $.child(div_1);

			treeItemIcon(node_3, () => $.get(item));

			var span = $.sibling(node_3, 2);
			var text = $.only_child(span, true);

			$.reset(div_1);
			$.reset(div);

			var node_4 = $.sibling(div, 2);

			{
				var consequent_3 = ($$anchor) => {
					{
						let $0 = $.derived(() => ({
							height: $.get(item).expanded ? "auto" : 0,
							opacity: $.get(item).expanded ? 1 : 0,
							scale: $.get(item).expanded ? 1 : 0.85
						}));

						let $1 = $.derived(() => ({
							height: { delay: $.get(item).expanded ? 0 : 0.1 },
							opacity: {
								ease: "easeOut",
								delay: $.get(item).expanded ? 0.1 : 0,
								duration: 0.2
							},
							type: "spring",
							stiffness: 200,
							damping: 20,
							mass: 0.15,
							bounce: 1
						}));

						let $2 = $.derived(() => !$.get(item).expanded ? 'pointer-events-none' : '');

						Motion($$anchor, $.spread_props(
							{
								tag: 'ul',
								get animate() {
									return $.get($0);
								},

								get transition() {
									return $.get($1);
								}
							},
							() => tree.group,
							{
								get class() {
									return `relative list-none p-0 ${$.get($2) ?? ''} origin-left`;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var div_2 = $.first_child(fragment_6);
									var node_5 = $.sibling(div_2, 2);

									treeItems(node_5, () => $.get(item).children, () => $.get(depth) + 1);
									$.template_effect(() => $.set_style(div_2, `left: ${0.5 + $.get(depth) * 1}rem`));
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							}
						));
					}
				};

				$.if(node_4, ($$render) => {
					if ($.get(item).children?.length) $$render(consequent_3);
				});
			}

			$.reset(li);

			$.template_effect(() => {
				$.set_style(div, `padding-left: ${$.get(depth) * 1}rem`);

				$.set_class(div_1, 1, `${$.get(item).selected
					? '!bg-accent-500 dark:!bg-accent-200 dark:!text-accent-950 !text-white'
					: ''}
					ring-accent-500 dark:ring-accent-700 flex h-full w-full items-center gap-2 rounded-xl
					px-3 py-1 ring-offset-white transition group-hover:bg-gray-200
					dark:ring-offset-black dark:group-hover:bg-gray-800`);

				$.set_text(text, $.get(item).item.title);
			});

			$.append($$anchor, li);
		});

		$.append($$anchor, fragment_4);
	};

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

	Preview($$anchor, {
		class: '!py-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_3();
			var div_3 = $.first_child(fragment_8);
			var node_6 = $.child(div_3);

			button(node_6, () => ({ onclick: tree.collapseAll, text: "Collapse All" }));

			var node_7 = $.sibling(node_6, 2);

			button(node_7, () => ({ onclick: tree.expandAll, text: "Expand All" }));
			$.reset(div_3);

			var ul = $.sibling(div_3, 2);

			$.attribute_effect(ul, () => ({
				class: 'mx-auto w-[300px] list-none rounded-md p-4',
				...tree.root
			}));

			var node_8 = $.child(ul);

			treeItems(node_8, () => tree.children, () => 0);
			$.reset(ul);
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);