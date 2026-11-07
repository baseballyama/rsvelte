import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Toc from '$lib/components/ui/toc';

export default function Toc_1($$anchor) {
	const toc = [
		{
			kind: 'h2',
			id: 'cli',
			level: 2,
			label: 'CLI',
			active: false,
			children: [
				{
					kind: 'h3',
					id: 'cli-installation',
					level: 3,
					label: 'Installation',
					active: false,
					children: []
				}
			]
		},

		{
			kind: 'h2',
			id: 'usage',
			level: 2,
			label: 'Usage',
			active: false,
			children: [
				{
					kind: 'h3',
					id: 'usage-components',
					level: 3,
					label: 'Components',
					active: false,
					children: []
				},

				{
					kind: 'h3',
					id: 'hooks',
					level: 3,
					label: 'Hooks',
					active: false,
					children: []
				}
			]
		}
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Toc.Root, ($$anchor, Toc_Root) => {
		Toc_Root($$anchor, {
			get toc() {
				return toc;
			}
		});
	});

	$.append($$anchor, fragment);
}