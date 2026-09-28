import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';
import { cls } from '@layerstack/tailwind';
import VscodeIconsFileTypeSvelte from '~icons/vscode-icons/file-type-svelte';
import VscodeIconsFileTypeTypescript from '~icons/vscode-icons/file-type-typescript';
import VscodeIconsFileTypeJavascript from '~icons/vscode-icons/file-type-js';
import VscodeIconsFileTypeCss from '~icons/vscode-icons/file-type-css';
import File from '~icons/lucide/file';
import Folder from '~icons/lucide/folder';
import FolderOpen from '~icons/lucide/folder-open';
import { Icon } from 'svelte-ux';

export default function TreeViewNode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			name,
			path,
			open = true,
			selected = false,
			onSelect,
			class: className,
			icon,
			children,
			type = 'button',
			onclick,
			$$slots,
			$$events,
			...rest
		} = $$props;

		function handleClick() {
			if (path && onSelect) {
				onSelect(path);
			}
		}

		function toggleOpen() {
			open = !open;
		}

		let fileIcon = $.derived(() => {
			if (name.endsWith('.svelte')) {
				return VscodeIconsFileTypeSvelte;
			} else if (name.endsWith('.ts')) {
				return VscodeIconsFileTypeTypescript;
			} else if (name.endsWith('.js')) {
				return VscodeIconsFileTypeJavascript;
			} else if (name.endsWith('.css')) {
				return VscodeIconsFileTypeCss;
			} else {
				return File;
			}
		});

		if (name.includes('.')) {
			$$renderer.push(`<!--[0--><button${$.attributes({
				type,
				class: $.clsx(cls('flex place-items-center gap-2 pl-[3px] hover:text-primary/80', selected && 'text-primary/80 group-hover:text-inherit', className)),
				...rest
			})}>`);

			if (icon) {
				$$renderer.push('<!--[0-->');
				icon($$renderer, { name, open });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
				Icon($$renderer, { data: fileIcon(), class: 'size-4' });
			}

			$$renderer.push(`<!--]--> <span>${$.escape(name)}</span></button>`);
		} else {
			$$renderer.push(`<!--[-1--><div><button type="button"${$.attr_class($.clsx(cls('flex place-items-center gap-2 group/folder', className)))}>`);

			if (icon) {
				$$renderer.push('<!--[0-->');
				icon($$renderer, { name, open });
				$$renderer.push(`<!---->`);
			} else if (open) {
				$$renderer.push('<!--[1-->');
				FolderOpen($$renderer, { class: 'size-4 text-surface-content' });
			} else {
				$$renderer.push('<!--[-1-->');
				Folder($$renderer, { class: 'size-4 text-surface-content' });
			}

			$$renderer.push(`<!--]--> <span class="group-hover/folder:text-primary/80">${$.escape(name)}</span></button> `);

			if (open) {
				$$renderer.push(`<!--[0--><div class="mx-2 border-l"><div class="relative flex place-items-start"><div class="bg-border mx-2 h-full w-px"></div> <div class="flex flex-col">`);
				children?.($$renderer);
				$$renderer.push(`<!----></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { open });
	});
}