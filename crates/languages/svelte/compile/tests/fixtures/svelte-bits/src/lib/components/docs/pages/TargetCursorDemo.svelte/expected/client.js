import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import TargetCursor from '$lib/components/library/Animations/TargetCursor/TargetCursor.svelte';
import source from '$lib/components/library/Animations/TargetCursor/TargetCursor.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:1.5rem;"><!> <button class="cursor-target" style="padding:1em 2em;border-radius:12px;background:#1a1a1a;color:#fff;border:1px solid #333;font-weight:600;cursor:none;">Target 1</button> <button class="cursor-target" style="padding:1em 2em;border-radius:12px;background:#1a1a1a;color:#fff;border:1px solid #333;font-weight:600;cursor:none;">Target 2</button> <button class="cursor-target" style="padding:1em 2em;border-radius:12px;background:#1a1a1a;color:#fff;border:1px solid #333;font-weight:600;cursor:none;">Target 3</button></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Target Cursor</h1> <!>`, 1);

export default function TargetCursorDemo($$anchor) {
	const DEFAULTS = {
		spinDuration: 2,
		hideDefaultCursor: true,
		hoverDuration: 0.2,
		parallaxOn: true
	};

	let spinDuration = $.state($.proxy(DEFAULTS.spinDuration));
	let hideDefaultCursor = $.state($.proxy(DEFAULTS.hideDefaultCursor));
	let hoverDuration = $.state($.proxy(DEFAULTS.hoverDuration));
	let parallaxOn = $.state($.proxy(DEFAULTS.parallaxOn));
	const hasChanges = $.derived(() => $.get(spinDuration) !== DEFAULTS.spinDuration || $.get(hideDefaultCursor) !== DEFAULTS.hideDefaultCursor || $.get(hoverDuration) !== DEFAULTS.hoverDuration || $.get(parallaxOn) !== DEFAULTS.parallaxOn);

	function reset() {
		$.set(spinDuration, DEFAULTS.spinDuration, true);
		$.set(hideDefaultCursor, DEFAULTS.hideDefaultCursor, true);
		$.set(hoverDuration, DEFAULTS.hoverDuration, true);
		$.set(parallaxOn, DEFAULTS.parallaxOn, true);
	}

	const usage = $.derived(() => `<TargetCursor targetSelector=".cursor-target" spinDuration={${$.get(spinDuration)}} hideDefaultCursor={${$.get(hideDefaultCursor)}} hoverDuration={${$.get(hoverDuration)}} parallaxOn={${$.get(parallaxOn)}} />`);

	const props = [
		{
			name: 'targetSelector',
			type: 'string',
			default: '".cursor-target"',
			description: 'Selector for target elements.'
		},

		{
			name: 'spinDuration',
			type: 'number',
			default: '2',
			description: 'Idle spin duration (s).'
		},

		{
			name: 'hideDefaultCursor',
			type: 'boolean',
			default: 'true',
			description: 'Hide native cursor while active.'
		},

		{
			name: 'hoverDuration',
			type: 'number',
			default: '0.2',
			description: 'Hover-lock transition duration (s).'
		},

		{
			name: 'parallaxOn',
			type: 'boolean',
			default: 'true',
			description: 'Subtle corner parallax on target hover.'
		}
	];

	var fragment = root_2();

	$.head('18yyxjt', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Target Cursor - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			TargetCursor(node_1, {
				targetSelector: '.cursor-target',
				get spinDuration() {
					return $.get(spinDuration);
				},

				get hideDefaultCursor() {
					return $.get(hideDefaultCursor);
				},

				get hoverDuration() {
					return $.get(hoverDuration);
				},

				get parallaxOn() {
					return $.get(parallaxOn);
				}
			});

			$.next(6);
			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'target-cursor',
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
					var node_2 = $.first_child(fragment_3);

					PreviewSlider(node_2, {
						title: 'Spin Duration',
						min: 0.5,
						max: 6,
						step: 0.1,
						get value() {
							return $.get(spinDuration);
						},
						valueUnit: 's',
						onChange: (v) => $.set(spinDuration, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Hover Duration',
						min: 0.05,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(hoverDuration);
						},
						valueUnit: 's',
						onChange: (v) => $.set(hoverDuration, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Hide Default Cursor',
						get checked() {
							return $.get(hideDefaultCursor);
						},
						onChange: (v) => $.set(hideDefaultCursor, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Parallax On Hover',
						get checked() {
							return $.get(parallaxOn);
						},
						onChange: (v) => $.set(parallaxOn, v, true)
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
			componentName: 'TargetCursor',
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