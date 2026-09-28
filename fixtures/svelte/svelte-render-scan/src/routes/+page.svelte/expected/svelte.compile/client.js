import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import Eye from '$lib/components/Logo.svelte';
import pkg from '../../package.json' with { type: 'json' };
import RenderScan from '$lib/components/RenderScan.svelte';

var root = $.from_html(`<div class="h-16 w-16 rounded-lg transition-all duration-300 svelte-1uha8ag"></div>`);
var root_1 = $.from_html(`<div class="flex items-center justify-center space-x-2 text-center sm:justify-start sm:text-left svelte-1uha8ag"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-1uha8ag"><polyline points="20 6 9 17 4 12" class="svelte-1uha8ag"></polyline></svg> <p class="svelte-1uha8ag"> </p></div>`);
var root_2 = $.from_html(`<label><input type="radio" name="installers" class="svelte-1uha8ag"/> <span class="svelte-1uha8ag"> </span></label>`);
var root_3 = $.from_html(`<div><div class="code-block svelte-1uha8ag"> </div></div>`);

var root_4 = $.from_html(
	`<div class="border-b-4 bg-[#faf6f4] py-12 svelte-1uha8ag"><div class="container mx-auto flex max-w-xl flex-col items-center text-center svelte-1uha8ag"><div><!></div> <div class="mb-10 flex flex-col items-center space-y-3 text-white md:flex-row md:space-x-3 md:space-y-0 svelte-1uha8ag"><div class="-rotate-2 rounded-xl bg-[#322f35] p-4 text-xl font-extrabold uppercase tracking-widest shadow-lg md:text-2xl svelte-1uha8ag">Svelte</div> <div class="rotate-3 rounded-xl p-4 text-xl font-extrabold uppercase tracking-widest shadow-lg md:text-2xl svelte-1uha8ag">Render</div> <div class="-rotate-2 rounded-xl bg-[#322f35] p-4 text-xl font-extrabold uppercase tracking-widest shadow-lg md:text-2xl svelte-1uha8ag">Scan</div></div> <h1 class="text-3xl font-bold md:text-5xl svelte-1uha8ag">Visual debugging for Svelte apps</h1> <p class="mxy-4 mt-10 max-w-prose px-4 py-2 text-lg md:text-xl svelte-1uha8ag">Watch your components update in real-time. Perfect for debugging reactivity and performance
			issues.</p> <div class="px-4 sm:px-0 svelte-1uha8ag"><div class="mt-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg svelte-1uha8ag"><h2 class="mb-4 text-lg font-bold svelte-1uha8ag">See DOM Updates Live</h2> <p class="mb-6 italic text-gray-600 svelte-1uha8ag">Try switching the highlight colors on this page below!</p> <div class="space-y-6 svelte-1uha8ag"><div class="flex items-center justify-between svelte-1uha8ag"><label for="highlight-color" class="font-medium svelte-1uha8ag">Page Highlight Color</label> <input type="color" id="highlight-color" class="h-8 w-12 svelte-1uha8ag"/></div> <div class="space-y-4 svelte-1uha8ag"><div class="flex justify-center svelte-1uha8ag"><button class="flex items-center space-x-2 rounded-xl border-2 border-amber-400 bg-amber-300 px-5 py-2 text-lg font-bold shadow transition-opacity disabled:cursor-not-allowed disabled:opacity-50 svelte-1uha8ag"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 svelte-1uha8ag" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" class="svelte-1uha8ag"></path></svg> <span class="svelte-1uha8ag">See it in action</span></button></div> <div class="flex justify-center space-x-4 svelte-1uha8ag"></div></div></div></div></div> <div class="mt-10 grid grid-cols-1 gap-4 self-stretch font-medium sm:grid-cols-3 svelte-1uha8ag"></div></div></div> <div class="container mx-auto max-w-2xl px-4 py-10 svelte-1uha8ag"><section class="svelte-1uha8ag"><div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center svelte-1uha8ag"><p class="text-xl font-bold svelte-1uha8ag">Install</p> <div class="space-x-1 svelte-1uha8ag"></div></div> <!></section> <section class="mt-10 svelte-1uha8ag"><p class="mb-4 text-xl font-bold svelte-1uha8ag">SvelteKit</p> <p class="mb-4 svelte-1uha8ag">Add to your root +layout.svelte file to enable the component in all pages:</p> <div class="code-block svelte-1uha8ag"></div></section> <section class="mt-10 svelte-1uha8ag"><p class="mb-4 text-xl font-bold svelte-1uha8ag">Vanilla Svelte</p> <div class="code-block svelte-1uha8ag"></div></section> <section class="mt-16 svelte-1uha8ag"><h2 class="mb-6 text-xl font-bold svelte-1uha8ag">Advanced Usage</h2> <div class="space-y-8 svelte-1uha8ag"><div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Start Disabled</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Start with render scanning disabled by default:</p> <div class="code-block svelte-1uha8ag"> </div></div> <div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Adjust Position</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Move the button left to avoid overlapping with other UI elements:</p> <div class="code-block svelte-1uha8ag"> </div></div> <div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Hide Icon</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Hide the render scan button while keeping functionality active:</p> <div class="code-block svelte-1uha8ag"></div></div> <div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Highlight Duration</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Adjust how long the render scan highlights remain on screen (default=1000):</p> <div class="code-block svelte-1uha8ag"></div></div> <div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Callback Function</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Optional user defined function that gets called once per valid mutation:</p> <div class="code-block svelte-1uha8ag"></div></div> <div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Combined Props</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Use multiple props together:</p> <div class="code-block svelte-1uha8ag"> </div></div></div></section> <p class="mb-2 mt-24 text-center svelte-1uha8ag"><a href="https://github.com/khromov/svelte-render-scan" class="underline svelte-1uha8ag">GitHub</a></p> <p class="text-center text-gray-500 svelte-1uha8ag"> </p> <!></div>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// Interactive demo state
	let highlightColor = $.state('#2189b5' // Changed to Sea Green
	);

	let mounted = $.state(false);
	let boxes = $.state($.proxy([]));
	let maxBoxes = 3;
	let isAnimating = $.state(false);
	let logoVisible = $.state(false);

	// Animate logo after a small delay when component mounts
	onMount(() => {
		// Delay the mounting of the render-scan component to avoid a flash on load
		setTimeout(
			() => {
				$.set(mounted, true);
			},
			100
		);

		$.set(logoVisible, true);
	});

	// Calculate text color based on background brightness
	function calculateBrightness(hexColor) {
		// Remove # if present
		const color = hexColor.replace('#', '');

		const r = parseInt(color.substring(0, 2), 16);
		const g = parseInt(color.substring(2, 4), 16);
		const b = parseInt(color.substring(4, 6), 16);

		// Calculate perceived brightness using relative luminance
		return (r * 299 + g * 587 + b * 114) / 1000;
	}

	let textColor = $.derived(() => {
		const brightness = calculateBrightness($.get(highlightColor));

		return brightness > 128 ? '#000000' : '#FFFFFF';
	});

	async function demonstrateRendering() {
		if ($.get(isAnimating)) return;

		$.set(isAnimating, true);

		$.set(
			boxes,
			[0], // Start with first box immediately
			true
		);

		// Add remaining boxes one by one with a delay
		for (let i = 1; i < maxBoxes; i++) {
			await new Promise((resolve) => setTimeout(resolve, 800));
			$.set(boxes, [...$.get(boxes), i], true);
		}

		$.set(isAnimating, false);
	}

	// Installation options
	const installers = [
		{ name: 'NPM', cmd: 'npm install -D svelte-render-scan' },
		{ name: 'PNPM', cmd: 'pnpm install -D svelte-render-scan' },
		{ name: 'Yarn', cmd: 'yarn add -D svelte-render-scan' },
		{ name: 'Bun', cmd: 'bun add svelte-render-scan -d' }
	];

	let installer = $.state($.proxy(installers[0].name));

	// Demo code snippet
	const demoCode = `<script>
  import { RenderScan } from 'svelte-render-scan';
<\/script>

<RenderScan />
`;

	const demoSvelteKitCode = `<script>
	import { dev } from '$app/environment';
	import { RenderScan } from 'svelte-render-scan';
<\/script>

{#if dev}
	<RenderScan />
{/if}`;

	// Advanced usage code snippets
	const advancedCode = {
		disable: `<RenderScan initialEnabled={false} />`,
		offset: `<RenderScan offsetLeft={60} />`,
		combined: `<RenderScan 
  initialEnabled={false}
  offsetLeft={60}
/>`
	};

	// Callback usage code snippet
	const callbackCode = `function customCallback(mutation: MutationRecord) {
	// Custom code...
}

<RenderScan callback={customCallback} />`;

	var fragment = root_4();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	let classes;
	let styles;
	var node = $.child(div_2);

	Eye(node, {
		size: 128,
		class: 'animate-[spin_1s_ease-in-out] hover:animate-[spin_1s_ease-in-out]',
		strokeWidth: 1.5
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling($.child(div_3), 2);

	$.next(2);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 6);
	var div_6 = $.child(div_5);
	var div_7 = $.sibling($.child(div_6), 4);
	var div_8 = $.child(div_7);
	var input = $.sibling($.child(div_8), 2);

	$.remove_input_defaults(input);
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var div_10 = $.child(div_9);
	var button = $.only_child(div_10);
	var div_11 = $.sibling(div_10, 2);

	$.each(div_11, 20, () => $.get(boxes), (box) => box, ($$anchor, box) => {
		var div_12 = root();

		$.template_effect(() => $.set_style(div_12, `background-color: ${$.get(highlightColor) ?? ''}`));
		$.append($$anchor, div_12);
	});

	$.reset(div_11);
	$.reset(div_9);
	$.reset(div_7);
	$.reset(div_6);
	$.reset(div_5);

	var div_13 = $.sibling(div_5, 2);

	$.each(div_13, 20, () => ['Track DOM Updates', 'Debug Re-renders', 'Visual Feedback'], $.index, ($$anchor, feature) => {
		var div_14 = root_1();
		var svg = $.child(div_14);
		var p = $.sibling(svg, 2);
		var text = $.only_child(p, true);

		$.reset(div_14);

		$.template_effect(() => {
			$.set_attribute(svg, 'stroke', $.get(highlightColor));
			$.set_text(text, feature);
		});

		$.append($$anchor, div_14);
	});

	$.reset(div_13);
	$.reset(div_1);
	$.reset(div);

	var div_15 = $.sibling(div, 2);
	var section = $.child(div_15);
	var div_16 = $.child(section);
	var div_17 = $.sibling($.child(div_16), 2);

	$.each(div_17, 21, () => installers, $.index, ($$anchor, i) => {
		var label = root_2();
		let classes_1;
		var input_1 = $.child(label);

		$.remove_input_defaults(input_1);

		var input_1_value;
		var span = $.sibling(input_1, 2);
		var text_1 = $.only_child(span, true);

		$.reset(label);

		$.template_effect(() => {
			$.set_attribute(label, 'for', $.get(i).name);
			classes_1 = $.set_class(label, 1, 'svelte-1uha8ag', null, classes_1, { checked: $.get(i).name === $.get(installer) });
			$.set_attribute(input_1, 'id', $.get(i).name);

			if (input_1_value !== (input_1_value = $.get(i).name)) {
				input_1.value = (input_1.__value = input_1_value) ?? '';
			}

			$.set_style(span, `background-color: ${($.get(i).name === $.get(installer) ? $.get(highlightColor) : '') ?? ''}; color: ${($.get(i).name === $.get(installer) ? $.get(textColor) : '') ?? ''}`);
			$.set_text(text_1, $.get(i).name);
		});

		$.bind_group(
			binding_group,
			[],
			input_1,
			() => {
				$.get(i).name;

				return $.get(installer);
			},
			($$value) => $.set(installer, $$value)
		);

		$.append($$anchor, label);
	});

	$.reset(div_17);
	$.reset(div_16);

	var node_1 = $.sibling(div_16, 2);

	$.each(node_1, 17, () => installers, $.index, ($$anchor, i) => {
		var div_18 = root_3();
		let classes_2;
		var div_19 = $.child(div_18);
		var text_2 = $.only_child(div_19, true);

		$.reset(div_18);

		$.template_effect(() => {
			classes_2 = $.set_class(div_18, 1, 'svelte-1uha8ag', null, classes_2, { hidden: $.get(installer) !== $.get(i).name });
			$.set_text(text_2, $.get(i).cmd);
		});

		$.append($$anchor, div_18);
	});

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_20 = $.sibling($.child(section_1), 4);

	div_20.textContent = '<script>\n	import { dev } from \'$app/environment\';\n	import { RenderScan } from \'svelte-render-scan\';\n</script>\n\n{#if dev}\n	<RenderScan />\n{/if}';
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_21 = $.sibling($.child(section_2), 2);

	div_21.textContent = '<script>\n  import { RenderScan } from \'svelte-render-scan\';\n</script>\n\n<RenderScan />\n';
	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var div_22 = $.sibling($.child(section_3), 2);
	var div_23 = $.child(div_22);
	var div_24 = $.sibling($.child(div_23), 4);
	var text_3 = $.only_child(div_24, true);

	$.reset(div_23);

	var div_25 = $.sibling(div_23, 2);
	var div_26 = $.sibling($.child(div_25), 4);
	var text_4 = $.only_child(div_26, true);

	$.reset(div_25);

	var div_27 = $.sibling(div_25, 2);
	var div_28 = $.sibling($.child(div_27), 4);

	div_28.textContent = '<RenderScan hideIcon={true} />';
	$.reset(div_27);

	var div_29 = $.sibling(div_27, 2);
	var div_30 = $.sibling($.child(div_29), 4);

	div_30.textContent = '<RenderScan duration={2000} />';
	$.reset(div_29);

	var div_31 = $.sibling(div_29, 2);
	var div_32 = $.sibling($.child(div_31), 4);

	div_32.textContent = 'function customCallback(mutation: MutationRecord) {\n	// Custom code...\n}\n\n<RenderScan callback={customCallback} />';
	$.reset(div_31);

	var div_33 = $.sibling(div_31, 2);
	var div_34 = $.sibling($.child(div_33), 4);
	var text_5 = $.only_child(div_34, true);

	$.reset(div_33);
	$.reset(div_22);
	$.reset(section_3);

	var p_1 = $.sibling(section_3, 4);
	var text_6 = $.only_child(p_1);
	var node_2 = $.sibling(p_1, 2);

	{
		var consequent = ($$anchor) => {
			RenderScan($$anchor, {
				callback: (m) => console.debug('Mutation observed!', m.type),
				duration: 1000
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(mounted)) $$render(consequent);
		});
	}

	$.reset(div_15);

	$.template_effect(
		($0) => {
			classes = $.set_class(div_2, 1, 'mb-4 transition-all duration-700 svelte-1uha8ag', null, classes, {
				'opacity-0': !$.get(logoVisible),
				'translate-y-4': !$.get(logoVisible)
			});

			styles = $.set_style(div_2, '', styles, { color: $.get(highlightColor) });
			$.set_style(div_4, `background-color: ${$.get(highlightColor) ?? ''}; color: ${$.get(textColor) ?? ''}`);
			button.disabled = $.get(isAnimating);
			$.set_text(text_3, advancedCode.disable);
			$.set_text(text_4, advancedCode.offset);
			$.set_text(text_5, advancedCode.combined);
			$.set_text(text_6, `© ${$0 ?? ''} svelte-render-scan · Version ${pkg.version ?? ''}`);
		},
		[() => new Date().getFullYear()]
	);

	$.bind_value(input, () => $.get(highlightColor), ($$value) => $.set(highlightColor, $$value));
	$.delegated('click', button, demonstrateRendering);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);