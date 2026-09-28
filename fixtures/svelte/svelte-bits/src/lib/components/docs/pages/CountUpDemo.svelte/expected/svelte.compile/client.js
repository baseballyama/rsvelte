import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import CountUp from '$lib/components/library/TextAnimations/CountUp/CountUp.svelte';
import countUpSource from '$lib/components/library/TextAnimations/CountUp/CountUp.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;min-height:400px;font-size:80px;font-weight:700;"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Count Up</h1> <!>`, 1);

export default function CountUpDemo($$anchor) {
	const DEFAULTS = {
		from: 0,
		to: 100,
		duration: 1,
		delay: 0,
		direction: 'up',
		separator: ','
	};

	let from = $.state($.proxy(DEFAULTS.from));
	let to = $.state($.proxy(DEFAULTS.to));
	let duration = $.state($.proxy(DEFAULTS.duration));
	let delay = $.state($.proxy(DEFAULTS.delay));
	let direction = $.state($.proxy(DEFAULTS.direction));
	let separator = $.state($.proxy(DEFAULTS.separator));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(from) !== DEFAULTS.from || $.get(to) !== DEFAULTS.to || $.get(duration) !== DEFAULTS.duration || $.get(delay) !== DEFAULTS.delay || $.get(direction) !== DEFAULTS.direction || $.get(separator) !== DEFAULTS.separator);

	function reset() {
		$.set(from, DEFAULTS.from, true);
		$.set(to, DEFAULTS.to, true);
		$.set(duration, DEFAULTS.duration, true);
		$.set(delay, DEFAULTS.delay, true);
		$.set(direction, DEFAULTS.direction, true);
		$.set(separator, DEFAULTS.separator, true);
		$.update(replay);
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import CountUp from '$lib/components/CountUp.svelte';
${'</' + 'script>'}

<CountUp
  from={${$.get(from)}}
  to={${$.get(to)}}
  separator="${$.get(separator)}"
  direction="${$.get(direction)}"
  duration={${$.get(duration)}}
  delay={${$.get(delay)}}
/>`);

	const props = [
		{
			name: 'to',
			type: 'number',
			default: '-',
			description: 'The target number to count up to.'
		},

		{
			name: 'from',
			type: 'number',
			default: '0',
			description: 'The initial number from which the count starts.'
		},

		{
			name: 'direction',
			type: 'string',
			default: '"up"',
			description: 'Direction of the count; can be "up" or "down". When this is set to "down", "from" and "to" become reversed, in order to count down.'
		},

		{
			name: 'delay',
			type: 'number',
			default: '0',
			description: 'Delay in seconds before the counting starts.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '2',
			description: 'Duration of the count animation - based on the damping and stiffness configured inside the component.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'CSS class to apply to the component for additional styling.'
		},

		{
			name: 'startWhen',
			type: 'boolean',
			default: 'true',
			description: 'A boolean to control whether the animation should start when the component is in view. It basically works like an if statement, if this is true, the count will start.'
		},

		{
			name: 'separator',
			type: 'string',
			default: '""',
			description: 'Character to use as a thousands separator in the displayed number.'
		},

		{
			name: 'onStart',
			type: 'function',
			default: '-',
			description: 'Callback function that is called when the count animation starts.'
		},

		{
			name: 'onEnd',
			type: 'function',
			default: '-',
			description: 'Callback function that is called when the count animation ends.'
		}
	];

	var fragment = root_2();

	$.head('185xr4y', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Count Up - svelte-bits';
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
				CountUp($$anchor, {
					get from() {
						return $.get(from);
					},

					get to() {
						return $.get(to);
					},

					get duration() {
						return $.get(duration);
					},

					get delay() {
						return $.get(delay);
					},

					get direction() {
						return $.get(direction);
					},

					get separator() {
						return $.get(separator);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'count-up',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return countUpSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					PreviewSlider(node_3, {
						title: 'To',
						min: 0,
						max: 10000,
						step: 100,
						get value() {
							return $.get(to);
						},

						onChange: (v) => {
							$.set(to, v, true);
							$.update(replay);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'From',
						min: 0,
						max: 1000,
						step: 10,
						get value() {
							return $.get(from);
						},

						onChange: (v) => {
							$.set(from, v, true);
							$.update(replay);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Duration',
						min: 0.5,
						max: 10,
						step: 0.5,
						get value() {
							return $.get(duration);
						},
						valueUnit: 's',
						onChange: (v) => $.set(duration, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Delay',
						min: 0,
						max: 5,
						step: 0.5,
						get value() {
							return $.get(delay);
						},
						valueUnit: 's',
						onChange: (v) => $.set(delay, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSelect(node_7, {
						title: 'Direction',
						options: [
							{ label: 'Up', value: 'up' },
							{ label: 'Down', value: 'down' }
						],

						get value() {
							return $.get(direction);
						},

						onChange: (v) => {
							$.set(direction, v, true);
							$.update(replay);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewInput(node_8, {
						title: 'Separator',
						get value() {
							return $.get(separator);
						},
						placeholder: ',',
						maxlength: 1,
						onChange: (v) => {
							$.set(separator, v.slice(-1), true);
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
			componentName: 'CountUp',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return countUpSource;
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