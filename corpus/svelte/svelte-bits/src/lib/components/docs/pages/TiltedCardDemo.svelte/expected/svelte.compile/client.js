import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import TiltedCard from '$lib/components/library/Components/TiltedCard/TiltedCard.svelte';
import source from '$lib/components/library/Components/TiltedCard/TiltedCard.svelte?raw';

const overlay = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

var root = $.from_html(`<p class="tilted-card-demo-text">Kendrick Lamar - GNX</p>`);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Tilted Card</h1> <!>`, 1);

export default function TiltedCardDemo($$anchor) {
	const DEFAULTS = {
		rotateAmplitude: 12,
		scaleOnHover: 1.05,
		showTooltip: true,
		displayOverlayContent: true
	};

	let rotateAmplitude = $.state($.proxy(DEFAULTS.rotateAmplitude));
	let scaleOnHover = $.state($.proxy(DEFAULTS.scaleOnHover));
	let showTooltip = $.state($.proxy(DEFAULTS.showTooltip));
	let displayOverlayContent = $.state($.proxy(DEFAULTS.displayOverlayContent));
	const hasChanges = $.derived(() => $.get(rotateAmplitude) !== DEFAULTS.rotateAmplitude || $.get(scaleOnHover) !== DEFAULTS.scaleOnHover || $.get(showTooltip) !== DEFAULTS.showTooltip || $.get(displayOverlayContent) !== DEFAULTS.displayOverlayContent);

	function reset() {
		$.set(rotateAmplitude, DEFAULTS.rotateAmplitude, true);
		$.set(scaleOnHover, DEFAULTS.scaleOnHover, true);
		$.set(showTooltip, DEFAULTS.showTooltip, true);
		$.set(displayOverlayContent, DEFAULTS.displayOverlayContent, true);
	}

	const usage = `<TiltedCard imageSrc="/your.jpg" altText="..." captionText="Caption" containerHeight="300px" containerWidth="300px" imageHeight="300px" imageWidth="300px" rotateAmplitude={14} scaleOnHover={1.1} />`;

	const props = [
		{
			name: 'imageSrc',
			type: 'string',
			default: '-',
			description: 'The source URL of the image to be displayed.'
		},

		{
			name: 'altText',
			type: 'string',
			default: "'Tilted card image'",
			description: 'Alt text for the image.'
		},

		{
			name: 'captionText',
			type: 'string',
			default: "''",
			description: 'Tooltip caption shown near the cursor.'
		},

		{
			name: 'containerHeight',
			type: 'string',
			default: "'300px'",
			description: 'Height of the outer container.'
		},

		{
			name: 'containerWidth',
			type: 'string',
			default: "'100%'",
			description: 'Width of the outer container.'
		},

		{
			name: 'imageHeight',
			type: 'string',
			default: "'300px'",
			description: 'Height of the image.'
		},

		{
			name: 'imageWidth',
			type: 'string',
			default: "'300px'",
			description: 'Width of the image.'
		},

		{
			name: 'scaleOnHover',
			type: 'number',
			default: '1.1',
			description: 'Scale factor when hovered.'
		},

		{
			name: 'rotateAmplitude',
			type: 'number',
			default: '14',
			description: 'Maximum tilt rotation in degrees.'
		},

		{
			name: 'showMobileWarning',
			type: 'boolean',
			default: 'true',
			description: 'Whether to show the mobile warning.'
		},

		{
			name: 'showTooltip',
			type: 'boolean',
			default: 'true',
			description: 'Whether to show the cursor tooltip.'
		},

		{
			name: 'displayOverlayContent',
			type: 'boolean',
			default: 'false',
			description: 'Whether to render the overlay snippet.'
		},

		{
			name: 'overlayContent',
			type: 'Snippet',
			default: '-',
			description: 'Snippet rendered as an overlay on the card.'
		}
	];

	var fragment = root_3();

	$.head('1oidi92', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Tilted Card - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			TiltedCard(node_1, {
				imageSrc: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
				altText: 'Kendrick Lamar - GNX Album Cover',
				captionText: 'Kendrick Lamar - GNX',
				containerHeight: '300px',
				containerWidth: '300px',
				imageHeight: '300px',
				imageWidth: '300px',
				get rotateAmplitude() {
					return $.get(rotateAmplitude);
				},

				get scaleOnHover() {
					return $.get(scaleOnHover);
				},
				showMobileWarning: false,
				get showTooltip() {
					return $.get(showTooltip);
				},

				get displayOverlayContent() {
					return $.get(displayOverlayContent);
				},

				get overlayContent() {
					return overlay;
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'tilted-card',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_2 = $.first_child(fragment_3);

					PreviewSlider(node_2, {
						title: 'Rotate Amplitude',
						min: 0,
						max: 30,
						step: 1,
						get value() {
							return $.get(rotateAmplitude);
						},
						onChange: (v) => $.set(rotateAmplitude, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Scale on Hover',
						min: 1,
						max: 1.5,
						step: 0.05,
						get value() {
							return $.get(scaleOnHover);
						},
						onChange: (v) => $.set(scaleOnHover, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSwitch(node_4, {
						title: 'Show Tooltip',
						get checked() {
							return $.get(showTooltip);
						},
						onChange: (v) => $.set(showTooltip, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Show Overlay Content',
						get checked() {
							return $.get(displayOverlayContent);
						},
						onChange: (v) => $.set(displayOverlayContent, v, true)
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
			componentName: 'TiltedCard',
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