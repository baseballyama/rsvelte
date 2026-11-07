import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Stack from '$lib/components/library/Components/Stack/Stack.svelte';
import source from '$lib/components/library/Components/Stack/Stack.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Stack</h1> <!>`, 1);

export default function StackDemo($$anchor) {
	const DEFAULTS = {
		randomRotation: false,
		sensitivity: 200,
		autoplay: false,
		autoplayDelay: 3000,
		pauseOnHover: false
	};

	let randomRotation = $.state($.proxy(DEFAULTS.randomRotation));
	let sensitivity = $.state($.proxy(DEFAULTS.sensitivity));
	let autoplay = $.state($.proxy(DEFAULTS.autoplay));
	let autoplayDelay = $.state($.proxy(DEFAULTS.autoplayDelay));
	let pauseOnHover = $.state($.proxy(DEFAULTS.pauseOnHover));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(randomRotation) !== DEFAULTS.randomRotation || $.get(sensitivity) !== DEFAULTS.sensitivity || $.get(autoplay) !== DEFAULTS.autoplay || $.get(autoplayDelay) !== DEFAULTS.autoplayDelay || $.get(pauseOnHover) !== DEFAULTS.pauseOnHover);

	function reset() {
		$.set(randomRotation, DEFAULTS.randomRotation, true);
		$.set(sensitivity, DEFAULTS.sensitivity, true);
		$.set(autoplay, DEFAULTS.autoplay, true);
		$.set(autoplayDelay, DEFAULTS.autoplayDelay, true);
		$.set(pauseOnHover, DEFAULTS.pauseOnHover, true);
		$.update(key);
	}

	const usage = `<Stack randomRotation={false} sensitivity={200} autoplay={false} autoplayDelay={3000} pauseOnHover={false} />`;

	const props = [
		{
			name: 'randomRotation',
			type: 'boolean',
			default: 'false',
			description: "Applies a random rotation to each card for a 'messy' look."
		},

		{
			name: 'sensitivity',
			type: 'number',
			default: '200',
			description: 'Drag sensitivity for sending a card to the back.'
		},

		{
			name: 'sendToBackOnClick',
			type: 'boolean',
			default: 'false',
			description: 'When enabled, the stack also shifts to the next card on click.'
		},

		{
			name: 'cardsData',
			type: 'StackCard[]',
			default: '[]',
			description: 'Array of cards to display.'
		},

		{
			name: 'animationConfig',
			type: '{ stiffness, damping }',
			default: '{ 260, 20 }',
			description: 'Spring animation configuration.'
		},

		{
			name: 'autoplay',
			type: 'boolean',
			default: 'false',
			description: 'Automatically cycles through cards.'
		},

		{
			name: 'autoplayDelay',
			type: 'number',
			default: '3000',
			description: 'Delay (ms) between auto transitions.'
		},

		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pauses autoplay on hover.'
		}
	];

	var fragment = root_2();

	$.head('1dlqdpc', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Stack - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				Stack($$anchor, {
					get randomRotation() {
						return $.get(randomRotation);
					},

					get sensitivity() {
						return $.get(sensitivity);
					},

					get autoplay() {
						return $.get(autoplay);
					},

					get autoplayDelay() {
						return $.get(autoplayDelay);
					},

					get pauseOnHover() {
						return $.get(pauseOnHover);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'stack',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewSwitch(node_2, {
						title: 'Random Rotation',
						get checked() {
							return $.get(randomRotation);
						},

						onChange: (v) => {
							$.set(randomRotation, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSwitch(node_3, {
						title: 'Autoplay',
						get checked() {
							return $.get(autoplay);
						},
						onChange: (v) => $.set(autoplay, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Pause On Hover',
						get checked() {
							return $.get(pauseOnHover);
						},
						onChange: (v) => $.set(pauseOnHover, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Sensitivity',
						min: 100,
						max: 300,
						step: 10,
						get value() {
							return $.get(sensitivity);
						},

						onChange: (v) => {
							$.set(sensitivity, v, true);
							$.update(key);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Autoplay Delay',
						min: 1000,
						max: 5000,
						step: 500,
						get value() {
							return $.get(autoplayDelay);
						},
						onChange: (v) => $.set(autoplayDelay, v, true)
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
			componentName: 'Stack',
			usage,
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