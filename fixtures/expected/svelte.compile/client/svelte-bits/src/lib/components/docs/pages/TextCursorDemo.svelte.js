import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import TextCursor from '$lib/components/library/TextAnimations/TextCursor/TextCursor.svelte';
import source from '$lib/components/library/TextAnimations/TextCursor/TextCursor.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:400px;overflow:hidden;display:flex;align-items:center;justify-content:center;"><!> <!> <div style="pointer-events:none;position:absolute;text-align:center;font-size:4rem;font-weight:900;user-select:none;color:#2F293A;">Hover Around!</div></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Text Cursor</h1> <!>`, 1);

export default function TextCursorDemo($$anchor) {
	const DEFAULTS = { text: '⚛️', followMouseDirection: true, randomFloat: true };
	let text = $.state($.proxy(DEFAULTS.text));
	let followMouseDirection = $.state($.proxy(DEFAULTS.followMouseDirection));
	let randomFloat = $.state($.proxy(DEFAULTS.randomFloat));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(text) !== DEFAULTS.text || $.get(followMouseDirection) !== DEFAULTS.followMouseDirection || $.get(randomFloat) !== DEFAULTS.randomFloat);

	function reset() {
		$.set(text, DEFAULTS.text, true);
		$.set(followMouseDirection, DEFAULTS.followMouseDirection, true);
		$.set(randomFloat, DEFAULTS.randomFloat, true);
		$.update(replay);
	}

	const usage = $.derived(() => `<TextCursor
  text="${$.get(text)}"
  spacing={80}
  followMouseDirection={${$.get(followMouseDirection)}}
  randomFloat={${$.get(randomFloat)}}
  exitDuration={0.3}
  removalInterval={20}
  maxPoints={10}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '"⚛️"',
			description: 'The text string to display as the trail.'
		},

		{
			name: 'spacing',
			type: 'number',
			default: '100',
			description: 'Spacing in pixels between each trail point.'
		},

		{
			name: 'followMouseDirection',
			type: 'boolean',
			default: 'true',
			description: 'If true, each text rotates to follow the mouse direction.'
		},

		{
			name: 'randomFloat',
			type: 'boolean',
			default: 'true',
			description: 'If true, enables random floating offsets in position and rotation.'
		},

		{
			name: 'exitDuration',
			type: 'number',
			default: '0.5',
			description: 'Duration in seconds for the exit (and entry opacity) animation of each trail item.'
		},

		{
			name: 'removalInterval',
			type: 'number',
			default: '30',
			description: 'Interval in milliseconds between removing trail items when the mouse stops moving.'
		},

		{
			name: 'maxPoints',
			type: 'number',
			default: '5',
			description: 'Maximum number of trail points to display.'
		}
	];

	var fragment = root_2();

	$.head('6rybn3', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Text Cursor - svelte-bits';
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
				TextCursor($$anchor, {
					get text() {
						return $.get(text);
					},

					get followMouseDirection() {
						return $.get(followMouseDirection);
					},

					get randomFloat() {
						return $.get(randomFloat);
					}
				});
			});

			$.next(2);
			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'text-cursor',
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
						title: 'Text',
						get value() {
							return $.get(text);
						},
						placeholder: 'Enter text...',
						maxlength: 10,
						onChange: (v) => $.set(text, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Follow Mouse Direction',
						get checked() {
							return $.get(followMouseDirection);
						},

						onChange: (v) => {
							$.set(followMouseDirection, v, true);
							$.update(replay);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Enable Random Floating',
						get checked() {
							return $.get(randomFloat);
						},

						onChange: (v) => {
							$.set(randomFloat, v, true);
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
			componentName: 'TextCursor',
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