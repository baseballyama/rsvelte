import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import DecryptedText from '$lib/components/library/TextAnimations/DecryptedText/DecryptedText.svelte';
import source from '$lib/components/library/TextAnimations/DecryptedText/DecryptedText.svelte?raw';

var root = $.from_html(`<div class="demo-container relative w-full overflow-hidden" style="height:400px;display:flex;align-items:center;justify-content:center;font-size:clamp(1.25rem, 3vw, 2.5rem);font-weight:600;"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Decrypted Text</h1> <!>`, 1);

export default function DecryptedTextDemo($$anchor) {
	const DEFAULTS = {
		speed: 60,
		maxIterations: 10,
		sequential: true,
		useOriginalCharsOnly: false,
		revealDirection: 'start',
		animateOn: 'view',
		clickMode: 'once'
	};

	let speed = $.state($.proxy(DEFAULTS.speed));
	let maxIterations = $.state($.proxy(DEFAULTS.maxIterations));
	let sequential = $.state($.proxy(DEFAULTS.sequential));
	let useOriginalCharsOnly = $.state($.proxy(DEFAULTS.useOriginalCharsOnly));
	let revealDirection = $.state($.proxy(DEFAULTS.revealDirection));
	let animateOn = $.state($.proxy(DEFAULTS.animateOn));
	let clickMode = $.state($.proxy(DEFAULTS.clickMode));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(speed) !== DEFAULTS.speed || $.get(maxIterations) !== DEFAULTS.maxIterations || $.get(sequential) !== DEFAULTS.sequential || $.get(useOriginalCharsOnly) !== DEFAULTS.useOriginalCharsOnly || $.get(revealDirection) !== DEFAULTS.revealDirection || $.get(animateOn) !== DEFAULTS.animateOn || $.get(clickMode) !== DEFAULTS.clickMode);

	function reset() {
		$.set(speed, DEFAULTS.speed, true);
		$.set(maxIterations, DEFAULTS.maxIterations, true);
		$.set(sequential, DEFAULTS.sequential, true);
		$.set(useOriginalCharsOnly, DEFAULTS.useOriginalCharsOnly, true);
		$.set(revealDirection, DEFAULTS.revealDirection, true);
		$.set(animateOn, DEFAULTS.animateOn, true);
		$.set(clickMode, DEFAULTS.clickMode, true);
		$.update(replay);
	}

	const usage = $.derived(() => `<DecryptedText
  text="Hacking into the mainframe..."
  speed={${$.get(speed)}}
  maxIterations={${$.get(maxIterations)}}
  sequential={${$.get(sequential)}}
  revealDirection="${$.get(revealDirection)}"
  useOriginalCharsOnly={${$.get(useOriginalCharsOnly)}}
  animateOn="${$.get(animateOn)}"
  clickMode="${$.get(clickMode)}"
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text content to decrypt.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '50',
			description: 'Time in ms between each iteration.'
		},

		{
			name: 'maxIterations',
			type: 'number',
			default: '10',
			description: 'Max number of random iterations (non-sequential mode).'
		},

		{
			name: 'sequential',
			type: 'boolean',
			default: 'false',
			description: 'Whether to reveal one character at a time in sequence.'
		},

		{
			name: 'revealDirection',
			type: '"start" | "end" | "center"',
			default: '"start"',
			description: 'From which position characters begin to reveal in sequential mode.'
		},

		{
			name: 'useOriginalCharsOnly',
			type: 'boolean',
			default: 'false',
			description: 'Restrict scrambling to only the characters already in the text.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'CSS class for revealed characters.'
		},

		{
			name: 'parentClassName',
			type: 'string',
			default: '""',
			description: 'CSS class for the main characters container.'
		},

		{
			name: 'encryptedClassName',
			type: 'string',
			default: '""',
			description: 'CSS class for encrypted characters.'
		},

		{
			name: 'animateOn',
			type: '"view" | "hover" | "inViewHover" | "click"',
			default: '"hover"',
			description: 'Trigger scrambling on hover, scroll-into-view, or click.'
		},

		{
			name: 'clickMode',
			type: '"once" | "toggle"',
			default: '"once"',
			description: 'Click behavior; only applies when animateOn is "click".'
		}
	];

	const animateOptions = [
		{ value: 'view', label: 'View' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'inViewHover', label: 'View & Hover' },
		{ value: 'click', label: 'Click' }
	];

	const clickOptions = [
		{ value: 'once', label: 'Once' },
		{ value: 'toggle', label: 'Toggle' }
	];

	const directionOptions = [
		{ value: 'start', label: 'Start' },
		{ value: 'end', label: 'End' },
		{ value: 'center', label: 'Center' }
	];

	var fragment = root_2();

	$.head('11e2gfd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Decrypted Text - svelte-bits';
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
				DecryptedText($$anchor, {
					text: 'Hacking into the mainframe...',
					get speed() {
						return $.get(speed);
					},

					get maxIterations() {
						return $.get(maxIterations);
					},

					get sequential() {
						return $.get(sequential);
					},

					get revealDirection() {
						return $.get(revealDirection);
					},

					get useOriginalCharsOnly() {
						return $.get(useOriginalCharsOnly);
					},

					get animateOn() {
						return $.get(animateOn);
					},

					get clickMode() {
						return $.get(clickMode);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'decrypted-text',
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
						title: 'Animate On',
						get options() {
							return animateOptions;
						},

						get value() {
							return $.get(animateOn);
						},

						onChange: (v) => {
							$.set(animateOn, v, true);
							$.update(replay);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => $.get(animateOn) !== 'click');

						PreviewSelect(node_4, {
							title: 'Click Mode',
							get options() {
								return clickOptions;
							},

							get value() {
								return $.get(clickMode);
							},

							get isDisabled() {
								return $.get($0);
							},

							onChange: (v) => {
								$.set(clickMode, v, true);
								$.update(replay);
							}
						});
					}

					var node_5 = $.sibling(node_4, 2);

					PreviewSelect(node_5, {
						title: 'Direction',
						get options() {
							return directionOptions;
						},

						get value() {
							return $.get(revealDirection);
						},

						onChange: (v) => {
							$.set(revealDirection, v, true);
							$.update(replay);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Speed',
						min: 10,
						max: 200,
						step: 10,
						get value() {
							return $.get(speed);
						},
						valueUnit: 'ms',
						onChange: (v) => {
							$.set(speed, v, true);
							$.update(replay);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Iterations',
						min: 1,
						max: 50,
						step: 1,
						get value() {
							return $.get(maxIterations);
						},

						onChange: (v) => {
							$.set(maxIterations, v, true);
							$.update(replay);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Sequential',
						get checked() {
							return $.get(sequential);
						},

						onChange: (v) => {
							$.set(sequential, v, true);
							$.update(replay);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Original Chars',
						get checked() {
							return $.get(useOriginalCharsOnly);
						},

						onChange: (v) => {
							$.set(useOriginalCharsOnly, v, true);
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
			componentName: 'DecryptedText',
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