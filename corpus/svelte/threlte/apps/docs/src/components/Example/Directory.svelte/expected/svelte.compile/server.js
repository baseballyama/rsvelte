import * as $ from 'svelte/internal/server';
import { ChevronRight, Folder, FolderOpen } from 'lucide-svelte';
import Self from './Directory.svelte';
import File from './File.svelte';

export default function Directory($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { directory, showDirectoryName = true, expanded = true } = $$props;

		const sortedFiles = $.derived(() => directory.files.sort((a, b) => {
			if (a.type === 'directory' && b.type === 'file') {
				return -1;
			} else if (a.type === 'file' && b.type === 'directory') {
				return 1;
			} else {
				return a.name.localeCompare(b.name);
			}
		}));

		if (showDirectoryName) {
			$$renderer.push(`<!--[0--><button${$.attr_class('flex flex-row items-center gap-1 font-bold', void 0, { 'expanded': expanded })}><div class="*:w-[1em]">`);

			if (expanded) {
				$$renderer.push('<!--[0-->');
				FolderOpen($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
				Folder($$renderer, {});
			}

			$$renderer.push(`<!--]--></div> ${$.escape(directory.name)} `);

			ChevronRight($$renderer, {
				class: `ml-1 h-[1em] w-[1em] translate-y-px rotate-0 transition-all duration-200 ${expanded ? '-translate-y-px rotate-90' : ''}`,
				'aria-hidden': 'true'
			});

			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <ul${$.attr_class($.clsx([
			'list-none',
			!expanded && 'hidden',
			showDirectoryName && 'ml-1.5 border-l border-white/20 pl-3'
		]))}><!--[-->`);

		const each_array = $.ensure_array_like(sortedFiles());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let file = each_array[$$index];

			$$renderer.push(`<li class="my-1 list-outside pl-0">`);

			if (file.type === 'directory') {
				$$renderer.push('<!--[0-->');
				Self($$renderer, { directory: file });
			} else {
				$$renderer.push('<!--[-1-->');
				File($$renderer, { file });
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ul>`);
		$.bind_props($$props, { expanded });
	});
}