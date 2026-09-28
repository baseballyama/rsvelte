import * as $ from 'svelte/internal/server';
import { TreeViewFile } from '$lib/components/ui/tree-view';
import * as Icons from '$lib/components/icons';

export default function Tree_view_file_custom($$renderer, $$props) {
	let { name } = $$props;

	{
		function icon($$renderer, { name }) {
			if (name.endsWith('.css')) {
				$$renderer.push('<!--[0-->');

				if (Icons.CSS) {
					$$renderer.push('<!--[-->');
					Icons.CSS($$renderer, { class: 'size-3' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else if (name.endsWith('.svelte')) {
				$$renderer.push('<!--[1-->');

				if (Icons.Svelte) {
					$$renderer.push('<!--[-->');
					Icons.Svelte($$renderer, { class: 'size-4' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else if (name.endsWith('.ts')) {
				$$renderer.push('<!--[2-->');

				if (Icons.TypeScript) {
					$$renderer.push('<!--[-->');
					Icons.TypeScript($$renderer, { class: 'size-3' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		TreeViewFile($$renderer, { name, icon, $$slots: { icon: true } });
	}
}