import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import TextType from '$lib/components/library/TextAnimations/TextType/TextType.svelte';
import source from '$lib/components/library/TextAnimations/TextType/TextType.svelte?raw';

var root = $.from_html(`<div class="demo-container relative w-full overflow-hidden p-16" style="min-height:350px;display:flex;align-items:flex-start;justify-content:flex-start;font-size:clamp(1.5rem, 4vw, 4rem);font-weight:700;"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Text Type</h1> <!>`, 1);

export default function TextTypeDemo($$anchor) {
	const TEXTS = [
		'Welcome to Svelte Bits! Good to see you!',
		'Build some amazing experiences!'
	];

	const DEFAULTS = {
		typingSpeed: 75,
		pauseDuration: 1500,
		deletingSpeed: 50,
		showCursor: true,
		cursorCharacter: '_',
		variableSpeedEnabled: false,
		variableSpeedMin: 60,
		variableSpeedMax: 120,
		cursorBlinkDuration: 0.5
	};

	let typingSpeed = $.state($.proxy(DEFAULTS.typingSpeed));
	let pauseDuration = $.state($.proxy(DEFAULTS.pauseDuration));
	let deletingSpeed = $.state($.proxy(DEFAULTS.deletingSpeed));
	let showCursor = $.state($.proxy(DEFAULTS.showCursor));
	let cursorCharacter = $.state($.proxy(DEFAULTS.cursorCharacter));
	let variableSpeedEnabled = $.state($.proxy(DEFAULTS.variableSpeedEnabled));
	let variableSpeedMin = $.state($.proxy(DEFAULTS.variableSpeedMin));
	let variableSpeedMax = $.state($.proxy(DEFAULTS.variableSpeedMax));
	let cursorBlinkDuration = $.state($.proxy(DEFAULTS.cursorBlinkDuration));
	let replay = $.state(0);

	const variableSpeed = $.derived(() => $.get(variableSpeedEnabled)
		? { min: $.get(variableSpeedMin), max: $.get(variableSpeedMax) }
		: undefined);

	const hasChanges = $.derived(() => $.get(typingSpeed) !== DEFAULTS.typingSpeed || $.get(pauseDuration) !== DEFAULTS.pauseDuration || $.get(deletingSpeed) !== DEFAULTS.deletingSpeed || $.get(showCursor) !== DEFAULTS.showCursor || $.get(cursorCharacter) !== DEFAULTS.cursorCharacter || $.get(variableSpeedEnabled) !== DEFAULTS.variableSpeedEnabled || $.get(variableSpeedMin) !== DEFAULTS.variableSpeedMin || $.get(variableSpeedMax) !== DEFAULTS.variableSpeedMax || $.get(cursorBlinkDuration) !== DEFAULTS.cursorBlinkDuration);

	function reset() {
		$.set(typingSpeed, DEFAULTS.typingSpeed, true);
		$.set(pauseDuration, DEFAULTS.pauseDuration, true);
		$.set(deletingSpeed, DEFAULTS.deletingSpeed, true);
		$.set(showCursor, DEFAULTS.showCursor, true);
		$.set(cursorCharacter, DEFAULTS.cursorCharacter, true);
		$.set(variableSpeedEnabled, DEFAULTS.variableSpeedEnabled, true);
		$.set(variableSpeedMin, DEFAULTS.variableSpeedMin, true);
		$.set(variableSpeedMax, DEFAULTS.variableSpeedMax, true);
		$.set(cursorBlinkDuration, DEFAULTS.cursorBlinkDuration, true);
		$.update(replay);
	}

	const usage = $.derived(() => `<TextType
  text={['Welcome to Svelte Bits! Good to see you!', 'Build some amazing experiences!']}
  typingSpeed={${$.get(typingSpeed)}}
  pauseDuration={${$.get(pauseDuration)}}
  deletingSpeed={${$.get(deletingSpeed)}}
  showCursor={${$.get(showCursor)}}
  cursorCharacter="${$.get(cursorCharacter)}"
  cursorBlinkDuration={${$.get(cursorBlinkDuration)}}${$.get(variableSpeedEnabled)
		? `
  variableSpeed={{ min: ${$.get(variableSpeedMin)}, max: ${$.get(variableSpeedMax)} }}`
		: ''}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string | string[]',
			default: '—',
			description: 'Text or array of texts to type out.'
		},

		{
			name: 'as',
			type: 'string',
			default: '"div"',
			description: 'HTML tag to render the component as.'
		},

		{
			name: 'typingSpeed',
			type: 'number',
			default: '50',
			description: 'Speed of typing in milliseconds.'
		},

		{
			name: 'initialDelay',
			type: 'number',
			default: '0',
			description: 'Initial delay before typing starts.'
		},

		{
			name: 'pauseDuration',
			type: 'number',
			default: '2000',
			description: 'Time to wait between typing and deleting.'
		},

		{
			name: 'deletingSpeed',
			type: 'number',
			default: '30',
			description: 'Speed of deleting characters.'
		},

		{
			name: 'loop',
			type: 'boolean',
			default: 'true',
			description: 'Whether to loop through the texts array.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Optional class name for the wrapper element.'
		},

		{
			name: 'showCursor',
			type: 'boolean',
			default: 'true',
			description: 'Whether to show the cursor.'
		},

		{
			name: 'hideCursorWhileTyping',
			type: 'boolean',
			default: 'false',
			description: 'Hide the cursor while typing or deleting.'
		},

		{
			name: 'cursorCharacter',
			type: 'string',
			default: '"|"',
			description: 'Character used as the cursor.'
		},

		{
			name: 'cursorBlinkDuration',
			type: 'number',
			default: '0.5',
			description: 'Duration in seconds of each cursor blink half-cycle.'
		},

		{
			name: 'cursorClassName',
			type: 'string',
			default: '""',
			description: 'Optional class name for the cursor element.'
		},

		{
			name: 'textColors',
			type: 'string[]',
			default: '[]',
			description: 'Array of colors cycled across each sentence.'
		},

		{
			name: 'variableSpeed',
			type: '{ min: number, max: number }',
			default: 'undefined',
			description: 'Random typing speed within the given range for a human-like feel.'
		},

		{
			name: 'onSentenceComplete',
			type: '(sentence: string, index: number) => void',
			default: 'undefined',
			description: 'Callback fired after each sentence is finished.'
		},

		{
			name: 'startOnVisible',
			type: 'boolean',
			default: 'false',
			description: 'Start typing only when the component scrolls into view.'
		},

		{
			name: 'reverseMode',
			type: 'boolean',
			default: 'false',
			description: 'Type the sentences backwards (right to left).'
		}
	];

	const cursorOptions = [
		{ value: '_', label: 'Underscore (_)' },
		{ value: '|', label: 'Pipe (|)' },
		{ value: '▎', label: 'Block (▎)' },
		{ value: '●', label: 'Dot (●)' },
		{ value: '█', label: 'Full Block (█)' }
	];

	var fragment = root_2();

	$.head('9zhk15', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Text Type - svelte-bits';
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
				TextType($$anchor, {
					get text() {
						return TEXTS;
					},

					get typingSpeed() {
						return $.get(typingSpeed);
					},

					get pauseDuration() {
						return $.get(pauseDuration);
					},

					get deletingSpeed() {
						return $.get(deletingSpeed);
					},

					get showCursor() {
						return $.get(showCursor);
					},

					get cursorCharacter() {
						return $.get(cursorCharacter);
					},

					get cursorBlinkDuration() {
						return $.get(cursorBlinkDuration);
					},

					get variableSpeed() {
						return $.get(variableSpeed);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'text-type',
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

					PreviewSelect(node_3, {
						title: 'Cursor Character',
						get options() {
							return cursorOptions;
						},

						get value() {
							return $.get(cursorCharacter);
						},

						onChange: (v) => {
							$.set(cursorCharacter, v, true);
							$.update(replay);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Typing Speed',
						min: 10,
						max: 200,
						step: 5,
						get value() {
							return $.get(typingSpeed);
						},
						valueUnit: 'ms',
						onChange: (v) => {
							$.set(typingSpeed, v, true);
							$.update(replay);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Pause Duration',
						min: 500,
						max: 5000,
						step: 100,
						get value() {
							return $.get(pauseDuration);
						},
						valueUnit: 'ms',
						onChange: (v) => {
							$.set(pauseDuration, v, true);
							$.update(replay);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Deleting Speed',
						min: 10,
						max: 100,
						step: 5,
						get value() {
							return $.get(deletingSpeed);
						},
						valueUnit: 'ms',
						onChange: (v) => {
							$.set(deletingSpeed, v, true);
							$.update(replay);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Cursor Blink Duration',
						min: 0.1,
						max: 2,
						step: 0.1,
						get value() {
							return $.get(cursorBlinkDuration);
						},
						valueUnit: 's',
						onChange: (v) => {
							$.set(cursorBlinkDuration, v, true);
							$.update(replay);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Show Cursor',
						get checked() {
							return $.get(showCursor);
						},

						onChange: (v) => {
							$.set(showCursor, v, true);
							$.update(replay);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Variable Speed',
						get checked() {
							return $.get(variableSpeedEnabled);
						},

						onChange: (v) => {
							$.set(variableSpeedEnabled, v, true);
							$.update(replay);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					{
						let $0 = $.derived(() => !$.get(variableSpeedEnabled));

						PreviewSlider(node_10, {
							title: 'Variable Speed Min',
							get isDisabled() {
								return $.get($0);
							},
							min: 10,
							max: 150,
							step: 5,
							get value() {
								return $.get(variableSpeedMin);
							},
							valueUnit: 'ms',
							onChange: (v) => {
								$.set(variableSpeedMin, v, true);
								$.update(replay);
							}
						});
					}

					var node_11 = $.sibling(node_10, 2);

					{
						let $0 = $.derived(() => !$.get(variableSpeedEnabled));

						PreviewSlider(node_11, {
							title: 'Variable Speed Max',
							get isDisabled() {
								return $.get($0);
							},
							min: 50,
							max: 300,
							step: 5,
							get value() {
								return $.get(variableSpeedMax);
							},
							valueUnit: 'ms',
							onChange: (v) => {
								$.set(variableSpeedMax, v, true);
								$.update(replay);
							}
						});
					}

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
			componentName: 'TextType',
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