import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';
import states from '$site/states.json?url';
import MarkerLayer from '$lib/MarkerLayer.svelte';
import GeoJSON from '$lib/GeoJSON.svelte';

var root = $.from_html(`<div class="text-sm font-bold"> </div>`);
var root_1 = $.from_html(`<button class="bg-primary text-primary-foreground hover:bg-primary/90 mb-4 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-xs transition-colors" type="button">Cycle Color</button> <!> <!>`, 1);

export default function _page($$anchor) {
	let colors = $.state($.proxy([
		'bg-gray-200 text-gray-800',
		'bg-red-200 text-red-800',
		'bg-teal-200 text-teal-800'
	]));

	function swapColor() {
		$.set(colors, [...$.get(colors).slice(1), $.get(colors)[0]], true);
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		center: [-98.137, 40.137],
		zoom: 4,
		standardControls: true,
		children: ($$anchor, $$slotProps) => {
			GeoJSON($$anchor, {
				id: 'states',
				get data() {
					return states;
				},
				promoteId: 'STATEFP',
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let feature = () => ($$arg0?.()).feature;
							var div = root();
							var text = $.only_child(div, true);

							$.template_effect(() => $.set_text(text, feature().properties?.NAME));
							$.append($$anchor, div);
						};

						MarkerLayer($$anchor, {
							draggable: true,
							get class() {
								return `rounded-full p-2 shadow ${$.get(colors)[0] ?? ''}`;
							},
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	CodeSample(node_1, {
		get code() {
			return code;
		}
	});

	$.delegated('click', button, swapColor);
	$.append($$anchor, fragment);
}

$.delegate(['click']);