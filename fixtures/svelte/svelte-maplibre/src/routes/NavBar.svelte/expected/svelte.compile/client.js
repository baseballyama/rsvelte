import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { beforeNavigate } from '$app/navigation';
import { page } from '$app/stores';
import { dev } from '$app/environment';
import { Button } from '$site/components/ui/button';
import LogoAndMenu from './LogoAndMenu.svelte';

var root = $.from_html(`<li><!></li>`);
var root_1 = $.from_html(`<div><h2 class="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wide uppercase">Tests</h2> <ul class="flex flex-col gap-0.5"></ul></div>`);
var root_2 = $.from_html(`<nav><!> <div><h2 class="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wide uppercase">Examples</h2> <ul class="flex flex-col gap-0.5"></ul></div> <!> <p class="mt-2 px-2 text-sm"><a class="hover:text-primary underline underline-offset-4" href="https://github.com/dimfeld/svelte-maplibre">Github</a></p></nav>`);

export default function NavBar($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/** Called after a navigation starts, used to close the mobile drawer. */
	let className = $.prop($$props, 'class', 3, '');

	const examples = [
		{ href: '/examples/basic', title: `Plain Map` },
		{ href: '/examples/marker', title: `Default Markers` },
		{ href: '/examples/custom_marker', title: `Custom Markers` },
		{
			href: '/examples/marker_on_click',
			title: `Add Marker On Click`
		},

		{
			href: '/examples/draggable_custom_marker',
			title: `Custom draggable Markers`
		},
		{ href: '/examples/popup_remote', title: `Remote Popup Data` },
		{
			href: '/examples/geojson_polygon',
			title: `GeoJSON Filled Polygon`
		},
		{ href: '/examples/geojson_line_layer', title: `Styled Line` },
		{ href: '/examples/heatmap', title: `Heatmap` },
		{ href: '/examples/controls', title: `Controls` },
		{ href: '/examples/clusters', title: `Clusters and Popups` },
		{
			href: '/examples/custom_marker_clusters',
			title: `Custom Markers and Clusters`
		},

		{
			href: '/examples/image_symbols',
			title: `Images in a Symbol Layer`
		},

		{
			href: '/examples/marker_layer',
			title: `Layer Consisting of Markers`
		},
		{ href: '/examples/draw', title: `Drawing` },
		{ href: '/examples/3d_buildings', title: `3D Buildings` },
		{
			href: '/examples/geojson_extrusion',
			title: `GeoJSON Extrusion`
		},

		{
			href: '/examples/zoom_transition',
			title: `Transition Layers with Zoom`
		},

		{
			href: '/examples/overlapping_layer_events',
			title: `Overlapping Layer Events`
		},
		{ href: '/examples/deckgl-arcs', title: `Deck.gl Arc Layers` },
		{
			href: '/examples/changing_basemap_style',
			title: `Changing basemap style`
		},
		{ href: '/examples/vector_source', title: `Vector Tile Source` },
		{ href: '/examples/pmtile_source', title: `PMTiles Source` },
		{ href: '/examples/data_join', title: `Client Side Data Join` },
		{ href: '/examples/raster_source', title: `Raster Source` },
		{ href: '/examples/image_source', title: `Image Source` },
		{
			href: '/examples/cooperative_gestures',
			title: `Cooperative Gestures`
		},
		{ href: '/examples/globe', title: `Globe` },
		{ href: '/examples/background', title: `Background Layer` },
		{ href: '/examples/3d_terrain', title: `3D Terrain` }
	];

	// Examples which don't really warrant showing on the docs site, but ensure that
	// certain functionality works properly.
	const tests = [
		{ href: '/tests/map-style-update', title: `Map Style Update` },
		{
			href: '/tests/marker-class-update',
			title: `Marker Class Update`
		},
		{ href: '/tests/marker-z-index', title: `Marker Z-Index` },
		{ href: '/tests/replace_source', title: `Replace a Source` },
		{
			href: '/tests/change_center_zoom',
			title: `Change Center and Zoom`
		},
		{ href: '/tests/standalone-popup', title: `Standalone Popup` }
	];

	beforeNavigate(() => {
		$$props.close?.();
	});

	var nav = root_2();
	var node = $.child(nav);

	LogoAndMenu(node, {});

	var div = $.sibling(node, 2);
	var ul = $.sibling($.child(div), 2);

	$.each(ul, 21, () => examples, ({ href, title }) => href, ($$anchor, $$item) => {
		let href = () => $.get($$item).href;
		let title = () => $.get($$item).title;
		var li = root();
		var node_1 = $.child(li);

		{
			let $0 = $.derived(() => href() === $page().url.pathname ? 'secondary' : 'ghost');

			Button(node_1, {
				get href() {
					return href();
				},

				get variant() {
					return $.get($0);
				},
				class: 'w-full justify-start font-normal',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, title()));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		}

		$.reset(li);
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var ul_1 = $.sibling($.child(div_1), 2);

			$.each(ul_1, 21, () => tests, ({ href, title }) => href, ($$anchor, $$item) => {
				let href = () => $.get($$item).href;
				let title = () => $.get($$item).title;
				var li_1 = root();
				var node_3 = $.child(li_1);

				{
					let $0 = $.derived(() => href() === $page().url.pathname ? 'secondary' : 'ghost');

					Button(node_3, {
						get href() {
							return href();
						},

						get variant() {
							return $.get($0);
						},
						class: 'w-full justify-start font-normal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, title()));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				$.reset(li_1);
				$.append($$anchor, li_1);
			});

			$.reset(ul_1);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if (dev) $$render(consequent);
		});
	}

	$.next(2);
	$.reset(nav);
	$.template_effect(() => $.set_class(nav, 1, `flex h-full w-full flex-col gap-4 overflow-y-auto p-4 ${className() ?? ''}`));
	$.append($$anchor, nav);
	$.pop();
	$$cleanup();
}