import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import ScrollFloat from '$lib/components/library/TextAnimations/ScrollFloat/ScrollFloat.svelte';
import source from '$lib/components/library/TextAnimations/ScrollFloat/ScrollFloat.svelte?raw';

var root = $.from_html(`<div class="demo-container relative h-[450px] w-full overflow-y-auto border border-white/10 bg-neutral-950 pt-[300px]" style="overscroll-behavior: contain;"><!> <!> <div class="h-[600px] w-full shrink-0"></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Scroll Float</h1> <!>`, 1);

export default function ScrollFloatDemo($$anchor) {
	const DEFAULTS = {
		children: 'Smooth Scroll Floating',
		animationDuration: 1,
		stagger: 0.03,
		ease: 'back.inOut(2)'
	};

	let children = $.state($.proxy(DEFAULTS.children));
	let animationDuration = $.state($.proxy(DEFAULTS.animationDuration));
	let stagger = $.state($.proxy(DEFAULTS.stagger));
	let ease = $.state($.proxy(DEFAULTS.ease));
	let replay = $.state(0);
	let containerRef = $.state(null);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(children) !== DEFAULTS.children || $.get(animationDuration) !== DEFAULTS.animationDuration || $.get(stagger) !== DEFAULTS.stagger || $.get(ease) !== DEFAULTS.ease);

	function reset() {
		$.set(children, DEFAULTS.children, true);
		$.set(animationDuration, DEFAULTS.animationDuration, true);
		$.set(stagger, DEFAULTS.stagger, true);
		$.set(ease, DEFAULTS.ease, true);
		$.update(replay);
	}

	const usage = $.derived(() => `${scriptOpen}
  import ScrollFloat from '$lib/components/ScrollFloat.svelte';
${scriptClose}

<div class="h-[200vh]">
  <ScrollFloat
    children="${$.get(children)}"
    animationDuration={${$.get(animationDuration)}}
    stagger={${$.get(stagger)}}
    ease="${$.get(ease)}"
  />
</div>`);

	const props = [
		{
			name: 'children',
			type: 'string',
			default: '""',
			description: 'Text to animate.'
		},

		{
			name: 'scrollContainer',
			type: 'HTMLElement | null',
			default: 'window',
			description: 'Optional scrolling element used by ScrollTrigger.'
		},

		{
			name: 'containerClass',
			type: 'string',
			default: '""',
			description: 'Classes applied to the outer heading element.'
		},

		{
			name: 'textClass',
			type: 'string',
			default: '""',
			description: 'Classes applied to the inner text wrapper.'
		},

		{
			name: 'animationDuration',
			type: 'number',
			default: '1',
			description: 'GSAP tween duration for each character.'
		},

		{
			name: 'ease',
			type: 'string',
			default: '"back.inOut(2)"',
			description: 'GSAP easing string.'
		},

		{
			name: 'scrollStart',
			type: 'string',
			default: '"center bottom+=50%"',
			description: 'ScrollTrigger start position.'
		},

		{
			name: 'scrollEnd',
			type: 'string',
			default: '"bottom bottom-=40%"',
			description: 'ScrollTrigger end position.'
		},

		{
			name: 'stagger',
			type: 'number',
			default: '0.03',
			description: 'Delay between each character animation.'
		}
	];

	var fragment = root_2();

	$.head('4msltz', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Scroll Float - svelte-bits';
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
				ScrollFloat($$anchor, {
					get children() {
						return $.get(children);
					},

					get animationDuration() {
						return $.get(animationDuration);
					},

					get stagger() {
						return $.get(stagger);
					},

					get ease() {
						return $.get(ease);
					},

					get scrollContainer() {
						return $.get(containerRef);
					},
					containerClass: 'text-5xl font-black text-center'
				});
			});

			$.next(2);
			$.reset(div);
			$.bind_this(div, ($$value) => $.set(containerRef, $$value), () => $.get(containerRef));
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'scroll-float',
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

					PreviewSlider(node_3, {
						title: 'Duration',
						min: 0.1,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(animationDuration);
						},

						onChange: (v) => {
							$.set(animationDuration, v, true);
							$.update(replay);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Stagger',
						min: 0.01,
						max: 0.2,
						step: 0.01,
						get value() {
							return $.get(stagger);
						},

						onChange: (v) => {
							$.set(stagger, v, true);
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
			componentName: 'ScrollFloat',
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