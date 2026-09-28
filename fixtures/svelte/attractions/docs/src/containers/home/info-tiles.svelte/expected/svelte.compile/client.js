import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import * as attractions from 'attractions';
import { s, formatFileSize } from 'attractions/utils';
import { GridIcon, Edit2Icon, FeatherIcon } from 'svelte-feather-icons';
import InfoTile from 'src/components/home/info-tile.svelte';

var root = $.from_html(`<div class="info-tiles"><!> <!> <!></div>`);

export default function Info_tiles($$anchor, $$props) {
	$.push($$props, true);

	const totalComponents = Object.keys(attractions).length - 1 - // utils
	1; // importer

	let bundleSizePromise = Promise.resolve(Infinity);

	onMount(() => {
		bundleSizePromise = fetch(`https://bundlephobia.com/api/size?package=attractions@${process.latest_version}`).then((response) => response.json());
	});

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => totalComponents);
		let $1 = $.derived(() => s(totalComponents));

		InfoTile(node, {
			get icon() {
				return GridIcon;
			},

			get title() {
				return `${$.get($0) ?? ''} component${$.get($1) ?? ''}`;
			},
			subtitle: 'and more to come!',
			href: './docs/components/button'
		});
	}

	var node_1 = $.sibling(node, 2);

	InfoTile(node_1, {
		get icon() {
			return Edit2Icon;
		},
		title: 'Stylable with Sass',
		subtitle: 'customize colors, fonts, shadows!',
		href: './docs/installation'
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(
		node_2,
		() => bundleSizePromise,
		($$anchor) => {
			InfoTile($$anchor, {
				get icon() {
					return FeatherIcon;
				},
				title: 'Calculating bundle size',
				subtitle: 'gimme a sec...',
				href: 'https://bundlephobia.com/result?p=attractions'
			});
		},
		($$anchor, bundleSize) => {
			{
				let $0 = $.derived(() => formatFileSize($.get(bundleSize)['size']));
				let $1 = $.derived(() => formatFileSize($.get(bundleSize)['gzip']));

				InfoTile($$anchor, {
					get icon() {
						return FeatherIcon;
					},

					get title() {
						return `${$.get($0) ?? ''} in size`;
					},

					get subtitle() {
						return `and only ${$.get($1) ?? ''} gzipped!`;
					},
					href: 'https://bundlephobia.com/result?p=attractions'
				});
			}
		},
		($$anchor) => {
			InfoTile($$anchor, {
				get icon() {
					return FeatherIcon;
				},
				title: 'Well, that\'s embarrasing',
				subtitle: 'an error occurred while fetching the bundle size.',
				href: 'https://bundlephobia.com/result?p=attractions'
			});
		}
	);

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}