import * as $ from 'svelte/internal/server';
import { CodeXml } from 'lucide-svelte';
import CodeExplorer from './CodeExplorer.svelte';
import { fade } from 'svelte/transition';
import { untrack } from 'svelte';
import { setCodeExampleContext } from './exampleContext.svelte';

export default function CodeWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			filePaths,
			hidePreview,
			showFile,
			exampleBasePath,
			children,
			expanded = false
		} = $$props;

		let childrenElements = [];

		const initialFilePath = untrack(() => showFile
			? filePaths.includes(showFile) ? showFile : 'App.svelte'
			: 'App.svelte');

		const initialFileName = initialFilePath.split('/').pop() || 'App.svelte';
		let context = { currentFilePath: initialFileName };

		setCodeExampleContext(context);

		const setChildren = (node) => {
			// the first child in node.children is an astro slot, so we need the children of that
			const firstChild = node.children[0];

			if (firstChild) {
				childrenElements = Array.from(firstChild.children).filter((item) => {
					return item instanceof HTMLElement;
				});
			}
		};

		$$renderer.push(`<div${$.attr_class($.clsx(
			// hide all children except the one that was selected
			// path is relative to the root of the example directory
			[
				'not-content relative flex w-full flex-col items-stretch overflow-hidden rounded-b-md! border-x border-b border-white/20 transition-all duration-700 ease-in-out will-change-[max-height] md:max-h-[80vh] md:flex-row',
				!expanded && 'max-h-[100px]! overflow-hidden',
				hidePreview && 'rounded-md! border-t'
			]
		))}>`);

		if (!expanded) {
			$$renderer.push(`<!--[0--><div class="absolute top-0 left-0 z-10 h-full w-full bg-linear-to-t from-blue-900 to-blue-900/50"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (!expanded) {
			$$renderer.push(`<!--[0--><div class="absolute top-0 left-0 flex h-full w-full flex-row items-center justify-center"><button class="border-orange/10 text-orange z-10 flex flex-row items-center justify-center gap-3 rounded-xs border bg-orange-800/50 px-2 py-1 text-sm backdrop-blur-md hover:bg-orange-800/70 hover:text-orange-400 focus:outline-hidden">`);
			CodeXml($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> <span>Show Code</span></button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		CodeExplorer($$renderer, { filePaths });
		$$renderer.push(`<!----> <div class="flex-1 overflow-x-auto">`);
		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
		$.bind_props($$props, { expanded });
	});
}