import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import CurvedLoop from '$lib/components/library/TextAnimations/CurvedLoop/CurvedLoop.svelte';
import source from '$lib/components/library/TextAnimations/CurvedLoop/CurvedLoop.svelte?raw';

var root = $.from_html(`<div class="demo-container relative w-full overflow-hidden" style="height:400px;padding:0;"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Curved Loop</h1> <!>`, 1);

export default function CurvedLoopDemo($$anchor) {
	const DEFAULTS = {
		marqueeText: 'Be ✦ Creative ✦ With ✦ Svelte ✦ Bits ✦',
		speed: 2,
		curveAmount: 400,
		interactive: true
	};

	let marqueeText = $.state($.proxy(DEFAULTS.marqueeText));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let curveAmount = $.state($.proxy(DEFAULTS.curveAmount));
	let interactive = $.state($.proxy(DEFAULTS.interactive));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(marqueeText) !== DEFAULTS.marqueeText || $.get(speed) !== DEFAULTS.speed || $.get(curveAmount) !== DEFAULTS.curveAmount || $.get(interactive) !== DEFAULTS.interactive);

	function reset() {
		$.set(marqueeText, DEFAULTS.marqueeText, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(curveAmount, DEFAULTS.curveAmount, true);
		$.set(interactive, DEFAULTS.interactive, true);
		$.update(replay);
	}

	const usage = $.derived(() => `<CurvedLoop
  marqueeText="${$.get(marqueeText)}"
  speed={${$.get(speed)}}
  curveAmount={${$.get(curveAmount)}}
  interactive={${$.get(interactive)}}
/>`);

	const props = [
		{
			name: 'marqueeText',
			type: 'string',
			default: '""',
			description: 'The text to display in the curved marquee.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '2',
			description: 'Animation speed of the marquee text.'
		},

		{
			name: 'class',
			type: 'string',
			default: 'undefined',
			description: 'CSS class name for styling the text.'
		},

		{
			name: 'curveAmount',
			type: 'number',
			default: '400',
			description: 'Amount of curve in the text path.'
		},

		{
			name: 'direction',
			type: '"left" | "right"',
			default: '"left"',
			description: 'Initial direction of the marquee animation.'
		},

		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Whether the marquee can be dragged by the user.'
		}
	];

	var fragment = root_2();

	$.head('bk2rtd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Curved Loop - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ReplayButton(node_1, { onClick: () => $.update(replay) });

			var node_2 = $.sibling(node_1, 2);

			$.key(node_2, () => $.get(replay), ($$anchor) => {
				CurvedLoop($$anchor, {
					get marqueeText() {
						return $.get(marqueeText);
					},

					get speed() {
						return $.get(speed);
					},

					get curveAmount() {
						return $.get(curveAmount);
					},

					get interactive() {
						return $.get(interactive);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'curved-loop',
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
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					PreviewInput(node_3, {
						title: 'Marquee Text',
						get value() {
							return $.get(marqueeText);
						},
						placeholder: 'Enter text...',
						onChange: (v) => {
							$.set(marqueeText, v, true);
							$.update(replay);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Speed',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(speed);
						},

						onChange: (v) => {
							$.set(speed, v, true);
							$.update(replay);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Curve Amount',
						min: -400,
						max: 400,
						step: 10,
						get value() {
							return $.get(curveAmount);
						},
						valueUnit: 'px',
						onChange: (v) => {
							$.set(curveAmount, v, true);
							$.update(replay);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Draggable',
						get checked() {
							return $.get(interactive);
						},

						onChange: (v) => {
							$.set(interactive, v, true);
							$.update(replay);
						}
					});

					$.append($$anchor, fragment_4);
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
			componentName: 'CurvedLoop',
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