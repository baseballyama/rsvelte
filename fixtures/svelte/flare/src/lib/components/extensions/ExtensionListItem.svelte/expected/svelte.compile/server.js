import * as $ from 'svelte/internal/server';
import Icon from '../Icon.svelte';
import { Download } from '@lucide/svelte';
import ListItemBase from '../nodes/shared/ListItemBase.svelte';

export default function ExtensionListItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ext, isSelected, onclick } = $$props;

		{
			function accessories($$renderer) {
				if (ext.commands.length > 0) {
					$$renderer.push(`<!--[0--><span class="text-muted-foreground text-sm">${$.escape(ext.commands.length)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="text-muted-foreground flex items-center gap-1 text-sm">`);
				Download($$renderer, { class: 'size-4' });
				$$renderer.push(`<!----> ${$.escape(ext.download_count.toLocaleString())}</div> `);

				Icon($$renderer, {
					icon: ext.author.avatar
						? { source: ext.author.avatar, mask: 'circle' }
						: undefined,
					class: 'size-6'
				});

				$$renderer.push(`<!---->`);
			}

			ListItemBase($$renderer, {
				title: ext.title,
				subtitle: ext.description,
				icon: ext.icons.light
					? { source: ext.icons.light, mask: 'roundedRectangle' }
					: undefined,
				isSelected,
				onclick,
				accessories,
				$$slots: { accessories: true }
			});
		}
	});
}