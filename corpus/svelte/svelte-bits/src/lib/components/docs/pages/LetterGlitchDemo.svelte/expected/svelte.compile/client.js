import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import LetterGlitch from '$lib/components/library/Backgrounds/LetterGlitch/LetterGlitch.svelte';
import source from '$lib/components/library/Backgrounds/LetterGlitch/LetterGlitch.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Letter Glitch</h1> <!>`, 1);

export default function LetterGlitchDemo($$anchor) {
	const D = {
		glitchSpeed: 50,
		smooth: true,
		outerVignette: true,
		centerVignette: false
	};

	let glitchSpeed = $.state($.proxy(D.glitchSpeed));
	let smooth = $.state($.proxy(D.smooth));
	let outerVignette = $.state($.proxy(D.outerVignette));
	let centerVignette = $.state($.proxy(D.centerVignette));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(glitchSpeed) !== D.glitchSpeed || $.get(smooth) !== D.smooth || $.get(outerVignette) !== D.outerVignette || $.get(centerVignette) !== D.centerVignette);

	function reset() {
		$.set(glitchSpeed, D.glitchSpeed, true);
		$.set(smooth, D.smooth, true);
		$.set(outerVignette, D.outerVignette, true);
		$.set(centerVignette, D.centerVignette, true);
	}

	const usage = $.derived(() => `${sO}
  import LetterGlitch from '$lib/components/LetterGlitch.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <LetterGlitch glitchSpeed={${$.get(glitchSpeed)}} smooth={${$.get(smooth)}} />
</div>`);

	const props = [
		{
			name: 'glitchColors',
			type: 'string[]',
			default: "['#2b4539', '#61dca3', '#61b3dc']",
			description: 'Palette.'
		},

		{
			name: 'glitchSpeed',
			type: 'number',
			default: '50',
			description: 'Glitch interval (ms).'
		},

		{
			name: 'smooth',
			type: 'boolean',
			default: 'true',
			description: 'Smooth color transitions.'
		},

		{
			name: 'outerVignette',
			type: 'boolean',
			default: 'true',
			description: 'Outer vignette.'
		},

		{
			name: 'centerVignette',
			type: 'boolean',
			default: 'false',
			description: 'Center vignette.'
		},

		{
			name: 'characters',
			type: 'string',
			default: 'A–Z!@#$…',
			description: 'Character set.'
		}
	];

	var fragment = root_2();

	$.head('vmm0bj', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Letter Glitch - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			LetterGlitch(node_1, {
				get glitchSpeed() {
					return $.get(glitchSpeed);
				},

				get smooth() {
					return $.get(smooth);
				},

				get outerVignette() {
					return $.get(outerVignette);
				},

				get centerVignette() {
					return $.get(centerVignette);
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
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'letter-glitch',
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
						title: 'Glitch Speed (ms)',
						min: 10,
						max: 500,
						step: 5,
						get value() {
							return $.get(glitchSpeed);
						},
						onChange: (v) => $.set(glitchSpeed, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Smooth',
						get checked() {
							return $.get(smooth);
						},
						onChange: (v) => $.set(smooth, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Outer Vignette',
						get checked() {
							return $.get(outerVignette);
						},
						onChange: (v) => $.set(outerVignette, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Center Vignette',
						get checked() {
							return $.get(centerVignette);
						},
						onChange: (v) => $.set(centerVignette, v, true)
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
			componentName: 'LetterGlitch',
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