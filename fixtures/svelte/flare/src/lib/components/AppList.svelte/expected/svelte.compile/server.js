import * as $ from 'svelte/internal/server';
import Fuse from 'fuse.js';
import Icon from '$lib/components/Icon.svelte';
import { convertFileSrc } from '@tauri-apps/api/core';
import { invoke } from '@tauri-apps/api/core';

export default function AppList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { apps, searchText, selectedIndex, startIndex, onItemClick } = $$props;
		const fuse = $.derived(() => new Fuse(apps, { keys: ['name', 'comment', 'exec'], threshold: 0.4 }));

		const filteredApps = $.derived(() => {
			if (!searchText) return apps;

			return fuse().search(searchText).map((result) => result.item);
		});

		function getFilteredApps() {
			return filteredApps();
		}

		function handleClick(index) {
			const absoluteIndex = startIndex + index;

			onItemClick(absoluteIndex);

			const app = filteredApps()[index];

			if (app && app.exec) {
				invoke('launch_app', { exec: app.exec }).catch(console.error);
			}
		}

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(filteredApps());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let app = each_array[index];
			const absoluteIndex = startIndex + index;

			$$renderer.push(`<button type="button"${$.attr_class('hover:bg-accent/50 flex w-full items-center gap-3 px-4 py-2 text-left', void 0, { 'bg-accent': selectedIndex === absoluteIndex })}><div class="flex size-5 shrink-0 items-center justify-center">`);

			if (app.icon_path) {
				$$renderer.push(`<!--[0--><img${$.attr('src', convertFileSrc(app.icon_path))} alt="" class="size-4"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
				Icon($$renderer, { icon: 'app-window-16', class: 'size-4' });
			}

			$$renderer.push(`<!--]--></div> <div class="flex flex-col"><span class="font-medium">${$.escape(app.name)}</span> <span class="text-muted-foreground text-sm">${$.escape(app.comment || 'No description')}</span></div> <span class="text-muted-foreground ml-auto text-xs whitespace-nowrap">System App</span></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { getFilteredApps });
	});
}