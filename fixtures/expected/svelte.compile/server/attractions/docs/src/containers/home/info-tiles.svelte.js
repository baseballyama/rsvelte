import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import * as attractions from 'attractions';
import { s, formatFileSize } from 'attractions/utils';
import { GridIcon, Edit2Icon, FeatherIcon } from 'svelte-feather-icons';
import InfoTile from 'src/components/home/info-tile.svelte';

export default function Info_tiles($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const totalComponents = Object.keys(attractions).length - 1 - // utils
		1; // importer

		let bundleSizePromise = Promise.resolve(Infinity);

		onMount(() => {
			bundleSizePromise = fetch(`https://bundlephobia.com/api/size?package=attractions@${process.latest_version}`).then((response) => response.json());
		});

		$$renderer.push(`<div class="info-tiles">`);

		InfoTile($$renderer, {
			icon: GridIcon,
			title: `${$.stringify(totalComponents)} component${$.stringify(s(totalComponents))}`,
			subtitle: 'and more to come!',
			href: './docs/components/button'
		});

		$$renderer.push(`<!----> `);

		InfoTile($$renderer, {
			icon: Edit2Icon,
			title: 'Stylable with Sass',
			subtitle: 'customize colors, fonts, shadows!',
			href: './docs/installation'
		});

		$$renderer.push(`<!----> `);

		$.await(
			$$renderer,
			bundleSizePromise,
			() => {
				InfoTile($$renderer, {
					icon: FeatherIcon,
					title: 'Calculating bundle size',
					subtitle: 'gimme a sec...',
					href: 'https://bundlephobia.com/result?p=attractions'
				});
			},
			(bundleSize) => {
				InfoTile($$renderer, {
					icon: FeatherIcon,
					title: `${$.stringify(formatFileSize(bundleSize['size']))} in size`,
					subtitle: `and only ${$.stringify(formatFileSize(bundleSize['gzip']))} gzipped!`,
					href: 'https://bundlephobia.com/result?p=attractions'
				});
			}
		);

		$$renderer.push(`<!--]--></div>`);
	});
}