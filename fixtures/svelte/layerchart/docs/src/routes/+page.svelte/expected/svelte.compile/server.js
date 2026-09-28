import * as $ from 'svelte/internal/server';
import { Button, MenuButton, ThemeSelect, Tooltip } from 'svelte-ux';
import Stats from '$lib/components/Stats.svelte';
import { cls } from '@layerstack/tailwind';
import { ExampleLink, Search } from '@layerstack/docs/components';
import { quickLinks } from '$lib/searchQuickLinks';
import LucideArrowUpRight from '~icons/lucide/arrow-up-right';
import LucideEllipsisVertical from '~icons/lucide/ellipsis-vertical';
import LucideGithub from '~icons/lucide/github';
import CustomBluesky from '~icons/custom-brands/bluesky';
import CustomDiscord from '~icons/custom-brands/discord';
import Logo from '$lib/components/Logo.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const links = [
			{ label: 'Home', href: '/' },
			{ label: 'Docs', href: '/docs' }
		];

		const examples = [
			// Charts
			{ component: 'ArcChart', example: 'gradient-with-text' },
			{ component: 'ArcChart', example: 'basic' },
			{ component: 'ArcChart', example: 'series-labels' },
			{ component: 'ArcChart', example: 'series-track-color' },
			{ component: 'AreaChart', example: 'brush' },
			{ component: 'AreaChart', example: 'curve' },
			{ component: 'AreaChart', example: 'funnel' },
			{ component: 'AreaChart', example: 'range-annotation' },
			{ component: 'AreaChart', example: 'radial' },
			{ component: 'Area', example: 'ridgeline-kde' },
			{ component: 'AreaChart', example: 'series-stack-gradient' },
			{ component: 'AreaChart', example: 'sparkline' },
			{ component: 'AreaChart', example: 'threshold' },
			{ component: 'AreaChart', example: 'threshold-gradient' },
			{ component: 'BarChart', example: 'duration' },
			{
				component: 'BarChart',
				example: 'duration-civilization-timeline'
			},
			{ component: 'BarChart', example: 'gradient' },
			{ component: 'BarChart', example: 'group-series-labels' },
			{ component: 'BarChart', example: 'labels' },
			{ component: 'BarChart', example: 'waterfall' },
			{ component: 'BarChart', example: 'oscilloscope-frequency' },
			{ component: 'BarChart', example: 'radial-horizontal-duration' },
			{
				component: 'BarChart',
				example: 'radial-horizontal-grid-between'
			},
			{ component: 'BarChart', example: 'radial-vertical-arcpadding' },
			{ component: 'BarChart', example: 'radial-weather' },
			{ component: 'BarChart', example: 'series-diverging' },
			{
				component: 'BarChart',
				example: 'series-horizontal-diverging'
			},
			{ component: 'BarChart', example: 'stack-series' },
			{ component: 'BarChart', example: 'series' },
			{ component: 'BarChart', example: 'series-horizontal' },
			{ component: 'BarChart', example: 'single-dimension' },
			{
				component: 'BarChart',
				example: 'single-stack-with-indicator'
			},
			{ component: 'BarChart', example: 'sparkbar' },
			{ component: 'BarChart', example: 'time-scale-interval' },
			{
				component: 'Chart',
				example: 'compound-separate-scales-with-stacked-charts-and-overridden-marks'
			},
			{ component: 'LineChart', example: 'gradient-encoding' },
			{ component: 'Trail', example: 'tdf-stage' },
			{ component: 'Spline', example: 'stroke-grouping' },
			{
				component: 'LineChart',
				example: 'bump-state-population-ranks'
			},
			{ component: 'LineChart', example: 'large-radial-series' },
			{ component: 'LineChart', example: 'large-series' },
			{ component: 'Density', example: 'weighted' },
			{ component: 'Contour', example: 'volcano-filled-interactive' },
			{ component: 'Vector', example: 'wind-map' },
			{ component: 'LineChart', example: 'radar' },
			{ component: 'LineChart', example: 'radar-series' },
			{ component: 'PieChart', example: 'arc' },
			{ component: 'PieChart', example: 'donut-with-text' },
			{ component: 'PieChart', example: 'series-props' },
			{ component: 'PieChart', example: 'segments' },
			{ component: 'ScatterChart', example: 'punchcard' },
			{ component: 'ScatterChart', example: 'series' },
			// Common
			{
				component: 'Axis',
				example: 'axis-label-placement-top-bottom'
			},
			{ component: 'Rule', example: 'candlestick-with-brushing' },
			// Primitives
			{ component: 'Arc', example: 'gauge-gradient' },
			{ component: 'Arc', example: 'clock' },
			{ component: 'Arc', example: 'color-wheel' },
			{ component: 'Arc', example: 'label-direction' },
			{ component: 'Link', example: 'playground' },
			{ component: 'Marker', example: 'styling' },
			{ component: 'Polygon', example: 'hexagon' },
			{ component: 'Image', example: 'us-presidents' },
			// Marks
			{ component: 'Calendar', example: 'rounded-cells' },

			// Statistics
			{ component: 'BoxPlot', example: 'with-tooltip' },

			// Interations
			{ component: 'TransformContext', example: 'pan-zoom-svg-image' },
			{ component: 'TransformContext', example: 'planet-distances' },
			{ component: 'BrushContext', example: 'synced-brushes' },
			{ component: 'Voronoi', example: 'radius' },
			// Fill
			{ component: 'LinearGradient', example: 'tailwind-colors' },
			{ component: 'Pattern', example: 'circles' },
			{ component: 'Pattern', example: 'with-lineargradient' },
			// Geo
			{ component: 'GeoPath', example: 'animated-globe' },
			{ component: 'GeoCircle', example: 'earthquake-globe' },
			{ component: 'GeoCircle', example: 'playground' },
			{ component: 'GeoPath', example: 'bubble-map' },
			{ component: 'GeoPath', example: 'choropleth' },
			{ component: 'GeoPath', example: 'spike-map' },
			{ component: 'Density', example: 'walmart' },
			{ component: 'Raster', example: 'us-water-vapor' },
			{ component: 'GeoRaster', example: 'globe' },
			{ component: 'GeoRaster', example: 'planets' },
			{ component: 'GeoRaster', example: 'projections' },
			{ component: 'GeoRaster', example: 'tiles-globe' },
			{ component: 'Vector', example: 'election-wind-map' },
			{ component: 'Image', example: 'college-football-map' },
			{ component: 'Hull', example: 'geo' },
			{ component: 'GeoPath', example: 'eclipses-globe' },
			{ component: 'GeoPath', example: 'submarine-cables-globe' },
			{ component: 'GeoPath', example: 'timezones' },
			{ component: 'GeoPath', example: 'transform-projection' },
			{ component: 'GeoPath', example: 'translucent-globe' },
			{ component: 'GeoPath', example: 'us-state-with-counties' },
			{ component: 'GeoPoint', example: 'icons' },
			{ component: 'GeoPoint', example: 'us-airports' },
			{ component: 'GeoPoint', example: 'world-airports' },
			{ component: 'GeoSpline', example: 'draggable-globe' },
			{ component: 'GeoSpline', example: 'world-map' },
			{ component: 'GeoTile', example: 'clipped' },
			{ component: 'GeoTile', example: 'zoomable-seamless-layers' },
			{ component: 'Graticule', example: 'basic' },
			// Layout
			{ component: 'Chord', example: 'gradient' },
			{ component: 'Dagre', example: 'playground' },
			{ component: 'Dagre', example: 'tcp-state-diagram' },
			{ component: 'ForceSimulation', example: 'beeswarm' },
			{ component: 'ForceSimulation', example: 'collision-detection' },
			{ component: 'ForceSimulation', example: 'disjoint-graph' },
			{ component: 'ForceSimulation', example: 'lattice' },
			{ component: 'ForceSimulation', example: 'text' },
			{ component: 'ForceSimulation', example: 'tree' },
			{ component: 'Pack', example: 'basic' },
			{ component: 'Partition', example: 'vertical' },
			{ component: 'Partition', example: 'sunburst' },
			{ component: 'Sankey', example: 'hierarchy' },
			{ component: 'Tree', example: 'basic' },
			{ component: 'Treemap', example: 'nested-zoom' },
			// Annotation
			{
				component: 'AnnotationLine',
				example: 'horizontal-with-range'
			},
			{ component: 'AnnotationPoint', example: 'line-to-point' },
			{
				component: 'AnnotationRange',
				example: 'horizontal-with-fill-multiple'
			},

			{
				component: 'AnnotationRange',
				example: 'vertical-with-gradient-range'
			},

			// Other
			{ component: 'MotionPath', example: 'sync-with-draw' }
		];

		$$renderer.push(`<header class="flex h-16 items-center px-4 py-2 svelte-18thta0"><a href="/" class="hidden xs:flex invisible md:visible items-center gap-3 w-60 text-xl font-bold svelte-18thta0">`);
		Logo($$renderer, { class: 'w-7' });
		$$renderer.push(`<!----> LayerChart</a> <div class="flex gap-2 grow justify-center items-center svelte-18thta0"><!--[-->`);

		const each_array = $.ensure_array_like(links);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { label, href } = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', href)}${$.attr_class($.clsx(cls('text-sm px-3 py-1 rounded-full text-surface-content hover:bg-primary/10 ', href === '/' && 'bg-primary-500/10 text-initial')), 'svelte-18thta0')}${$.attr('target', href.startsWith('http') ? '_blank' : '_self')}>${$.escape(label)}</a>`);
		}

		$$renderer.push(`<!--]--> `);

		Search($$renderer, {
			hideInput: true,
			showExampleScreenshots: true,
			defaultOptions: quickLinks
		});

		$$renderer.push(`<!----></div> <div class="flex items-center justify-end gap-2 w-60 svelte-18thta0"><div class="flex items-center border-r pr-2 svelte-18thta0">`);
		ThemeSelect($$renderer, { keyboardShortcuts: true });
		$$renderer.push(`<!----></div> <div class="hidden md:flex svelte-18thta0">`);

		Tooltip($$renderer, {
			title: 'Discord',
			placement: 'left',
			offset: 2,
			children: ($$renderer) => {
				Button($$renderer, {
					icon: CustomDiscord,
					href: 'https://discord.gg/697JhMPD3t',
					class: 'p-2',
					target: '_blank'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Tooltip($$renderer, {
			title: 'Bluesky',
			placement: 'left',
			offset: 2,
			children: ($$renderer) => {
				Button($$renderer, {
					icon: CustomBluesky,
					href: 'https://bsky.app/profile/techniq.dev',
					class: 'p-2',
					target: '_blank'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Tooltip($$renderer, {
			title: 'View repository',
			placement: 'left',
			offset: 2,
			children: ($$renderer) => {
				Button($$renderer, {
					icon: LucideGithub,
					href: 'https://github.com/techniq/layerchart',
					class: 'p-2',
					target: '_blank'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		MenuButton($$renderer, {
			icon: LucideEllipsisVertical,
			menuIcon: null,
			iconOnly: true,
			options: [
				{
					label: 'Svelte UX',
					value: 'https://svelte-ux.techniq.dev',
					icon: LucideArrowUpRight
				},

				{
					label: 'Github',
					value: 'https://github.com/techniq/layerchart',
					icon: LucideGithub
				},

				{
					label: 'Discord',
					value: 'https://discord.gg/697JhMPD3t',
					icon: CustomDiscord
				},

				{
					label: 'Bluesky',
					value: 'https://bsky.app/profile/techniq.dev',
					icon: CustomBluesky
				}
			],
			class: 'inline-block md:hidden',
			$$slots: {
				selection: ($$renderer) => {
					$$renderer.push(`<span slot="selection" class="hidden svelte-18thta0"></span>`);
				}
			}
		});

		$$renderer.push(`<!----></div></header> <div class="absolute top-0 w-full h-256 background-gradient pointer-events-none svelte-18thta0"></div> <div class="flex flex-col gap-2 items-center pt-8 relative h-120 lg:h-140 perspective-[1000px] overflow-clip svelte-18thta0">`);
		Logo($$renderer, { class: 'w-14 lg:w-20' });
		$$renderer.push(`<!----> <h1 class="text-6xl lg:text-8xl text-center mb-2 pb-2 font-extrabold text-transparent bg-clip-text bg-linear-to-br from-primary to-secondary tracking-wide svelte-18thta0">LayerChart</h1> <div class="lg:text-lg text-center font-light max-w-100 px-4 mx-auto svelte-18thta0">Composable Svelte chart components to build a large variety of visualizations</div> <div class="flex justify-center gap-3 mt-8 svelte-18thta0">`);

		Button($$renderer, {
			href: '/docs/getting-started',
			variant: 'fill',
			rounded: 'full',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Get Started`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			href: '/docs/examples',
			variant: 'fill-outline',
			rounded: 'full',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Examples`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="pointer-events-none absolute inset-0 overflow-hidden opacity-30 dark:opacity-20 perspective-[1000px] perspective-origin-bottom mask-y-from-50% svelte-18thta0"><div class="absolute inset-0 transform-3d svelte-18thta0"><div class="background-grid absolute left-[-200%] bottom-0 h-[300vh] w-[600vw] origin-bottom svelte-18thta0"></div></div></div></div> <div class="grid grid-cols-3 sm:grid-cols-xs gap-2 sm:gap-4 px-4 mb-4 svelte-18thta0"><!--[-->`);

		const each_array_1 = $.ensure_array_like(examples);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let { component, example } = each_array_1[$$index_1];

			ExampleLink($$renderer, { component, example, variant: 'hover-label', aspect: 'video' });
		}

		$$renderer.push(`<!--]--></div> `);
		Stats($$renderer, {});
		$$renderer.push(`<!----> <footer class="flex justify-between px-4 py-8 border-t text-surface-content/50 text-sm svelte-18thta0"><div class="svelte-18thta0">Made by <a href="https://github.com/techniq" target="_blank" class="text-surface-content svelte-18thta0">Sean Lynch</a> and <a href="https://github.com/techniq/layerchart/graphs/contributors" target="_blank" class="text-surface-content svelte-18thta0">contributors</a></div> <div class="flex gap-5 svelte-18thta0"><a href="/docs/guides/LLMs" target="_blank" class="svelte-18thta0">LLMs</a> <a href="https://github.com/techniq/layerchart" target="_blank" class="svelte-18thta0">Github</a> <a href="/docs/releases" class="svelte-18thta0">Releases</a></div></footer>`);
	});
}