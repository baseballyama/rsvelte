import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Orb from '$lib/components/library/Backgrounds/Orb/Orb.svelte';
import source from '$lib/components/library/Backgrounds/Orb/Orb.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Orb</h1> <!>`, 1);

export default function OrbDemo($$anchor) {
	const D = {
		hue: 200,
		hoverIntensity: 0.5,
		rotateOnHover: true,
		forceHoverState: false,
		backgroundColor: '#14110E'
	};

	let hue = $.state($.proxy(D.hue));
	let hoverIntensity = $.state($.proxy(D.hoverIntensity));
	let rotateOnHover = $.state($.proxy(D.rotateOnHover));
	let forceHoverState = $.state($.proxy(D.forceHoverState));
	let backgroundColor = $.state($.proxy(D.backgroundColor));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(hue) !== D.hue || $.get(hoverIntensity) !== D.hoverIntensity || $.get(rotateOnHover) !== D.rotateOnHover || $.get(forceHoverState) !== D.forceHoverState || $.get(backgroundColor) !== D.backgroundColor);

	function reset() {
		$.set(hue, D.hue, true);
		$.set(hoverIntensity, D.hoverIntensity, true);
		$.set(rotateOnHover, D.rotateOnHover, true);
		$.set(forceHoverState, D.forceHoverState, true);
		$.set(backgroundColor, D.backgroundColor, true);
	}

	const usage = $.derived(() => `${sO}
  import Orb from '$lib/components/Orb.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Orb hue={${$.get(hue)}} hoverIntensity={${$.get(hoverIntensity)}} rotateOnHover={${$.get(rotateOnHover)}} forceHoverState={${$.get(forceHoverState)}} />
</div>`);

	const props = [
		{
			name: 'hue',
			type: 'number',
			default: '0',
			description: 'Hue rotation in degrees.'
		},

		{
			name: 'hoverIntensity',
			type: 'number',
			default: '0.2',
			description: 'Strength of hover distortion.'
		},

		{
			name: 'rotateOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Rotate while hovered.'
		},

		{
			name: 'forceHoverState',
			type: 'boolean',
			default: 'false',
			description: 'Force hover state always on.'
		},

		{
			name: 'backgroundColor',
			type: 'string',
			default: "'#000000'",
			description: 'Background color.'
		}
	];

	var fragment = root_2();

	$.head('rny5yr', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Orb - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			let styles;
			var node_1 = $.child(div);

			Orb(node_1, {
				get hue() {
					return $.get(hue);
				},

				get hoverIntensity() {
					return $.get(hoverIntensity);
				},

				get rotateOnHover() {
					return $.get(rotateOnHover);
				},

				get forceHoverState() {
					return $.get(forceHoverState);
				},

				get backgroundColor() {
					return $.get(backgroundColor);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			BackgroundContentToggle(node_2, {
				get showContent() {
					return $.get(showContent);
				},
				onToggle: (v) => $.set(showContent, v, true)
			});

			$.reset(div);
			$.template_effect(() => styles = $.set_style(div, '', styles, { 'background-color': $.get(backgroundColor) }));
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'orb',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					PreviewSlider(node_3, {
						title: 'Hue',
						min: 0,
						max: 360,
						step: 1,
						get value() {
							return $.get(hue);
						},
						onChange: (v) => $.set(hue, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Hover Intensity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(hoverIntensity);
						},
						onChange: (v) => $.set(hoverIntensity, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Rotate On Hover',
						get checked() {
							return $.get(rotateOnHover);
						},
						onChange: (v) => $.set(rotateOnHover, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Force Hover State',
						get checked() {
							return $.get(forceHoverState);
						},
						onChange: (v) => $.set(forceHoverState, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewColorPicker(node_7, {
						title: 'Background',
						get value() {
							return $.get(backgroundColor);
						},
						onChange: (v) => $.set(backgroundColor, v, true)
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'Orb',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment);
}