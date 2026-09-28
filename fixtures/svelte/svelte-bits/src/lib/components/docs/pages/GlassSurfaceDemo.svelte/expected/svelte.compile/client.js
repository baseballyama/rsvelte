import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GlassSurface from '$lib/components/library/Components/GlassSurface/GlassSurface.svelte';
import source from '$lib/components/library/Components/GlassSurface/GlassSurface.svelte?raw';

var root = $.from_html(`<span style="color:white;font-size:18px;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.4);">Glass Surface</span>`);
var root_1 = $.from_html(`<div role="presentation" class="demo-container relative" style="height:500px;display:flex;align-items:center;justify-content:center;background-image:url('https://images.unsplash.com/photo-1714957770116-415df80b8ef7?q=80&amp;w=1932&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');background-size:cover;background-position:center;border-radius:24px;overflow:hidden;"><div><!></div></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Glass Surface</h1> <!>`, 1);

export default function GlassSurfaceDemo($$anchor, $$props) {
	$.push($$props, true);

	// Elastic cursor-follow state for the demo container
	let stageRef;

	let glassX = $.state(0);
	let glassY = $.state(0);
	let targetX = 0;
	let targetY = 0;
	let active = false;
	const MAX_OFFSET = 24; // pixels; "a few pixels" elastic band

	onMount(() => {
		let raf = 0;

		const tick = () => {
			const tx = active ? targetX : 0;
			const ty = active ? targetY : 0;

			$.set(glassX, $.get(glassX) + (tx - $.get(glassX)) * 0.12);
			$.set(glassY, $.get(glassY) + (ty - $.get(glassY)) * 0.12);
			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(raf);
	});

	function onMove(e) {
		if (!stageRef) return;

		const r = stageRef.getBoundingClientRect();
		const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
		const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);

		targetX = Math.max(-1, Math.min(1, dx)) * MAX_OFFSET;
		targetY = Math.max(-1, Math.min(1, dy)) * MAX_OFFSET;
		active = true;
	}

	function onLeave() {
		active = false;
	}

	const DEFAULTS = {
		borderRadius: 50,
		borderWidth: 0.07,
		brightness: 50,
		opacity: 0.93,
		blur: 11,
		displace: 0.5,
		backgroundOpacity: 0.1,
		saturation: 1,
		distortionScale: -180,
		redOffset: 0,
		greenOffset: 10,
		blueOffset: 20
	};

	let borderRadius = $.state($.proxy(DEFAULTS.borderRadius));
	let borderWidth = $.state($.proxy(DEFAULTS.borderWidth));
	let brightness = $.state($.proxy(DEFAULTS.brightness));
	let opacity = $.state($.proxy(DEFAULTS.opacity));
	let blur = $.state($.proxy(DEFAULTS.blur));
	let displace = $.state($.proxy(DEFAULTS.displace));
	let backgroundOpacity = $.state($.proxy(DEFAULTS.backgroundOpacity));
	let saturation = $.state($.proxy(DEFAULTS.saturation));
	let distortionScale = $.state($.proxy(DEFAULTS.distortionScale));
	let redOffset = $.state($.proxy(DEFAULTS.redOffset));
	let greenOffset = $.state($.proxy(DEFAULTS.greenOffset));
	let blueOffset = $.state($.proxy(DEFAULTS.blueOffset));
	const hasChanges = $.derived(() => $.get(borderRadius) !== DEFAULTS.borderRadius || $.get(borderWidth) !== DEFAULTS.borderWidth || $.get(brightness) !== DEFAULTS.brightness || $.get(opacity) !== DEFAULTS.opacity || $.get(blur) !== DEFAULTS.blur || $.get(displace) !== DEFAULTS.displace || $.get(backgroundOpacity) !== DEFAULTS.backgroundOpacity || $.get(saturation) !== DEFAULTS.saturation || $.get(distortionScale) !== DEFAULTS.distortionScale || $.get(redOffset) !== DEFAULTS.redOffset || $.get(greenOffset) !== DEFAULTS.greenOffset || $.get(blueOffset) !== DEFAULTS.blueOffset);

	function reset() {
		$.set(borderRadius, DEFAULTS.borderRadius, true);
		$.set(borderWidth, DEFAULTS.borderWidth, true);
		$.set(brightness, DEFAULTS.brightness, true);
		$.set(opacity, DEFAULTS.opacity, true);
		$.set(blur, DEFAULTS.blur, true);
		$.set(displace, DEFAULTS.displace, true);
		$.set(backgroundOpacity, DEFAULTS.backgroundOpacity, true);
		$.set(saturation, DEFAULTS.saturation, true);
		$.set(distortionScale, DEFAULTS.distortionScale, true);
		$.set(redOffset, DEFAULTS.redOffset, true);
		$.set(greenOffset, DEFAULTS.greenOffset, true);
		$.set(blueOffset, DEFAULTS.blueOffset, true);
	}

	const usage = `<GlassSurface width={300} height={120} borderRadius={50}>Hello</GlassSurface>`;

	const props = [
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content rendered inside the glass.'
		},

		{
			name: 'width',
			type: 'number | string',
			default: '200',
			description: 'Width.'
		},

		{
			name: 'height',
			type: 'number | string',
			default: '80',
			description: 'Height.'
		},

		{
			name: 'borderRadius',
			type: 'number',
			default: '20',
			description: 'Corner radius (px).'
		},

		{
			name: 'borderWidth',
			type: 'number',
			default: '0.07',
			description: 'Edge thickness factor.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '50',
			description: 'Brightness %.'
		},

		{
			name: 'opacity',
			type: 'number',
			default: '0.93',
			description: 'Element opacity.'
		},

		{
			name: 'blur',
			type: 'number',
			default: '11',
			description: 'Input blur (px).'
		},

		{
			name: 'displace',
			type: 'number',
			default: '0',
			description: 'Output blur (stdDeviation).'
		},

		{
			name: 'backgroundOpacity',
			type: 'number',
			default: '0',
			description: 'Frost opacity 0–1.'
		},

		{
			name: 'saturation',
			type: 'number',
			default: '1',
			description: 'Backdrop saturation.'
		},

		{
			name: 'distortionScale',
			type: 'number',
			default: '-180',
			description: 'Main displacement scale.'
		},

		{
			name: 'redOffset',
			type: 'number',
			default: '0',
			description: 'Red channel offset.'
		},

		{
			name: 'greenOffset',
			type: 'number',
			default: '10',
			description: 'Green channel offset.'
		},

		{
			name: 'blueOffset',
			type: 'number',
			default: '20',
			description: 'Blue channel offset.'
		},

		{
			name: 'xChannel',
			type: "'R' | 'G' | 'B'",
			default: "'R'",
			description: 'X displacement channel.'
		},

		{
			name: 'yChannel',
			type: "'R' | 'G' | 'B'",
			default: "'G'",
			description: 'Y displacement channel.'
		},

		{
			name: 'mixBlendMode',
			type: 'BlendMode',
			default: "'difference'",
			description: 'Blend mode.'
		}
	];

	var fragment = root_3();

	$.head('1qpagwl', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Glass Surface - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			{
				const children = ($$anchor) => {
					var span = root();

					$.append($$anchor, span);
				};

				GlassSurface(node_1, {
					width: 400,
					height: 150,
					get borderRadius() {
						return $.get(borderRadius);
					},

					get borderWidth() {
						return $.get(borderWidth);
					},

					get brightness() {
						return $.get(brightness);
					},

					get opacity() {
						return $.get(opacity);
					},

					get blur() {
						return $.get(blur);
					},

					get displace() {
						return $.get(displace);
					},

					get backgroundOpacity() {
						return $.get(backgroundOpacity);
					},

					get saturation() {
						return $.get(saturation);
					},

					get distortionScale() {
						return $.get(distortionScale);
					},

					get redOffset() {
						return $.get(redOffset);
					},

					get greenOffset() {
						return $.get(greenOffset);
					},

					get blueOffset() {
						return $.get(blueOffset);
					},
					children,
					$$slots: { default: true }
				});
			}

			$.reset(div_1);
			$.reset(div);
			$.bind_this(div, ($$value) => stageRef = $$value, () => stageRef);
			$.template_effect(() => $.set_style(div_1, `transform: translate3d(${$.get(glassX) ?? ''}px, ${$.get(glassY) ?? ''}px, 0); will-change: transform;`));
			$.delegated('mousemove', div, onMove);
			$.event('mouseleave', div, onLeave);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'glass-surface',
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
						title: 'Border Radius',
						min: 0,
						max: 200,
						step: 1,
						get value() {
							return $.get(borderRadius);
						},
						onChange: (v) => $.set(borderRadius, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Border Width',
						min: 0,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(borderWidth);
						},
						onChange: (v) => $.set(borderWidth, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Brightness',
						min: 0,
						max: 100,
						step: 1,
						get value() {
							return $.get(brightness);
						},
						onChange: (v) => $.set(brightness, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Opacity',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(opacity);
						},
						onChange: (v) => $.set(opacity, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Blur',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(blur);
						},
						onChange: (v) => $.set(blur, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Displace',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(displace);
						},
						onChange: (v) => $.set(displace, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Background Opacity',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(backgroundOpacity);
						},
						onChange: (v) => $.set(backgroundOpacity, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Saturation',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(saturation);
						},
						onChange: (v) => $.set(saturation, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Distortion Scale',
						min: -300,
						max: 300,
						step: 5,
						get value() {
							return $.get(distortionScale);
						},
						onChange: (v) => $.set(distortionScale, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Red Offset',
						min: -50,
						max: 50,
						step: 1,
						get value() {
							return $.get(redOffset);
						},
						onChange: (v) => $.set(redOffset, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Green Offset',
						min: -50,
						max: 50,
						step: 1,
						get value() {
							return $.get(greenOffset);
						},
						onChange: (v) => $.set(greenOffset, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Blue Offset',
						min: -50,
						max: 50,
						step: 1,
						get value() {
							return $.get(blueOffset);
						},
						onChange: (v) => $.set(blueOffset, v, true)
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
			componentName: 'GlassSurface',
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
	$.pop();
}

$.delegate(['mousemove']);