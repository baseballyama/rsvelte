import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import Eye from '$lib/components/Logo.svelte';
import pkg from '../../package.json' with { type: 'json' };
import RenderScan from '$lib/components/RenderScan.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Interactive demo state
		let highlightColor = '#2189b5'; // Changed to Sea Green

		let mounted = false;
		let boxes = [];
		let maxBoxes = 3;
		let isAnimating = false;
		let logoVisible = false;

		// Animate logo after a small delay when component mounts
		onMount(() => {
			// Delay the mounting of the render-scan component to avoid a flash on load
			setTimeout(
				() => {
					mounted = true;
				},
				100
			);

			logoVisible = true;
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
			const brightness = calculateBrightness(highlightColor);

			return brightness > 128 ? '#000000' : '#FFFFFF';
		});

		async function demonstrateRendering() {
			if (isAnimating) return;

			isAnimating = true;
			boxes = [0]; // Start with first box immediately

			// Add remaining boxes one by one with a delay
			for (let i = 1; i < maxBoxes; i++) {
				await new Promise((resolve) => setTimeout(resolve, 800));
				boxes = [...boxes, i];
			}

			isAnimating = false;
		}

		// Installation options
		const installers = [
			{ name: 'NPM', cmd: 'npm install -D svelte-render-scan' },
			{ name: 'PNPM', cmd: 'pnpm install -D svelte-render-scan' },
			{ name: 'Yarn', cmd: 'yarn add -D svelte-render-scan' },
			{ name: 'Bun', cmd: 'bun add svelte-render-scan -d' }
		];

		let installer = installers[0].name;

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

		$$renderer.push(`<div class="border-b-4 bg-[#faf6f4] py-12 svelte-1uha8ag"><div class="container mx-auto flex max-w-xl flex-col items-center text-center svelte-1uha8ag"><div${$.attr_class('mb-4 transition-all duration-700 svelte-1uha8ag', void 0, { 'opacity-0': !logoVisible, 'translate-y-4': !logoVisible })}${$.attr_style('', { color: highlightColor })}>`);

		Eye($$renderer, {
			size: 128,
			class: 'animate-[spin_1s_ease-in-out] hover:animate-[spin_1s_ease-in-out]',
			strokeWidth: 1.5
		});

		$$renderer.push(`<!----></div> <div class="mb-10 flex flex-col items-center space-y-3 text-white md:flex-row md:space-x-3 md:space-y-0 svelte-1uha8ag"><div class="-rotate-2 rounded-xl bg-[#322f35] p-4 text-xl font-extrabold uppercase tracking-widest shadow-lg md:text-2xl svelte-1uha8ag">Svelte</div> <div class="rotate-3 rounded-xl p-4 text-xl font-extrabold uppercase tracking-widest shadow-lg md:text-2xl svelte-1uha8ag"${$.attr_style(`background-color: ${$.stringify(highlightColor)}; color: ${$.stringify(textColor())}`)}>Render</div> <div class="-rotate-2 rounded-xl bg-[#322f35] p-4 text-xl font-extrabold uppercase tracking-widest shadow-lg md:text-2xl svelte-1uha8ag">Scan</div></div> <h1 class="text-3xl font-bold md:text-5xl svelte-1uha8ag">Visual debugging for Svelte apps</h1> <p class="mxy-4 mt-10 max-w-prose px-4 py-2 text-lg md:text-xl svelte-1uha8ag">Watch your components update in real-time. Perfect for debugging reactivity and performance
			issues.</p> <div class="px-4 sm:px-0 svelte-1uha8ag"><div class="mt-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg svelte-1uha8ag"><h2 class="mb-4 text-lg font-bold svelte-1uha8ag">See DOM Updates Live</h2> <p class="mb-6 italic text-gray-600 svelte-1uha8ag">Try switching the highlight colors on this page below!</p> <div class="space-y-6 svelte-1uha8ag"><div class="flex items-center justify-between svelte-1uha8ag"><label for="highlight-color" class="font-medium svelte-1uha8ag">Page Highlight Color</label> <input type="color" id="highlight-color"${$.attr('value', highlightColor)} class="h-8 w-12 svelte-1uha8ag"/></div> <div class="space-y-4 svelte-1uha8ag"><div class="flex justify-center svelte-1uha8ag"><button${$.attr('disabled', isAnimating, true)} class="flex items-center space-x-2 rounded-xl border-2 border-amber-400 bg-amber-300 px-5 py-2 text-lg font-bold shadow transition-opacity disabled:cursor-not-allowed disabled:opacity-50 svelte-1uha8ag"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 svelte-1uha8ag" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" class="svelte-1uha8ag"></path></svg> <span class="svelte-1uha8ag">See it in action</span></button></div> <div class="flex justify-center space-x-4 svelte-1uha8ag"><!--[-->`);

		const each_array = $.ensure_array_like(boxes);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let box = each_array[$$index];

			$$renderer.push(`<div class="h-16 w-16 rounded-lg transition-all duration-300 svelte-1uha8ag"${$.attr_style(`background-color: ${$.stringify(highlightColor)}`)}></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div></div> <div class="mt-10 grid grid-cols-1 gap-4 self-stretch font-medium sm:grid-cols-3 svelte-1uha8ag"><!--[-->`);

		const each_array_1 = $.ensure_array_like(['Track DOM Updates', 'Debug Re-renders', 'Visual Feedback']);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let feature = each_array_1[$$index_1];

			$$renderer.push(`<div class="flex items-center justify-center space-x-2 text-center sm:justify-start sm:text-left svelte-1uha8ag"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"${$.attr('stroke', highlightColor)} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-1uha8ag"><polyline points="20 6 9 17 4 12" class="svelte-1uha8ag"></polyline></svg> <p class="svelte-1uha8ag">${$.escape(feature)}</p></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="container mx-auto max-w-2xl px-4 py-10 svelte-1uha8ag"><section class="svelte-1uha8ag"><div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center svelte-1uha8ag"><p class="text-xl font-bold svelte-1uha8ag">Install</p> <div class="space-x-1 svelte-1uha8ag"><!--[-->`);

		const each_array_2 = $.ensure_array_like(installers);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let i = each_array_2[$$index_2];

			$$renderer.push(`<label${$.attr('for', i.name)}${$.attr_class('svelte-1uha8ag', void 0, { 'checked': i.name === installer })}><input type="radio"${$.attr('id', i.name)} name="installers"${$.attr('value', i.name)}${$.attr('checked', installer === i.name, true)} class="svelte-1uha8ag"/> <span${$.attr_style(`background-color: ${$.stringify(i.name === installer ? highlightColor : '')}; color: ${$.stringify(i.name === installer ? textColor() : '')}`)} class="svelte-1uha8ag">${$.escape(i.name)}</span></label>`);
		}

		$$renderer.push(`<!--]--></div></div> <!--[-->`);

		const each_array_3 = $.ensure_array_like(installers);

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let i = each_array_3[$$index_3];

			$$renderer.push(`<div${$.attr_class('svelte-1uha8ag', void 0, { 'hidden': installer !== i.name })}><div class="code-block svelte-1uha8ag">${$.escape(i.cmd)}</div></div>`);
		}

		$$renderer.push(`<!--]--></section> <section class="mt-10 svelte-1uha8ag"><p class="mb-4 text-xl font-bold svelte-1uha8ag">SvelteKit</p> <p class="mb-4 svelte-1uha8ag">Add to your root +layout.svelte file to enable the component in all pages:</p> <div class="code-block svelte-1uha8ag">&lt;script>
	import { dev } from '$app/environment';
	import { RenderScan } from 'svelte-render-scan';
&lt;/script>

{#if dev}
	&lt;RenderScan />
{/if}</div></section> <section class="mt-10 svelte-1uha8ag"><p class="mb-4 text-xl font-bold svelte-1uha8ag">Vanilla Svelte</p> <div class="code-block svelte-1uha8ag">&lt;script>
  import { RenderScan } from 'svelte-render-scan';
&lt;/script>

&lt;RenderScan />
</div></section> <section class="mt-16 svelte-1uha8ag"><h2 class="mb-6 text-xl font-bold svelte-1uha8ag">Advanced Usage</h2> <div class="space-y-8 svelte-1uha8ag"><div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Start Disabled</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Start with render scanning disabled by default:</p> <div class="code-block svelte-1uha8ag">${$.escape(advancedCode.disable)}</div></div> <div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Adjust Position</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Move the button left to avoid overlapping with other UI elements:</p> <div class="code-block svelte-1uha8ag">${$.escape(advancedCode.offset)}</div></div> <div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Hide Icon</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Hide the render scan button while keeping functionality active:</p> <div class="code-block svelte-1uha8ag">&lt;RenderScan hideIcon={true} /></div></div> <div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Highlight Duration</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Adjust how long the render scan highlights remain on screen (default=1000):</p> <div class="code-block svelte-1uha8ag">&lt;RenderScan duration={2000} /></div></div> <div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Callback Function</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Optional user defined function that gets called once per valid mutation:</p> <div class="code-block svelte-1uha8ag">function customCallback(mutation: MutationRecord) {
	// Custom code...
}

&lt;RenderScan callback={customCallback} /></div></div> <div class="svelte-1uha8ag"><h3 class="mb-2 font-bold svelte-1uha8ag">Combined Props</h3> <p class="mb-3 text-gray-600 svelte-1uha8ag">Use multiple props together:</p> <div class="code-block svelte-1uha8ag">${$.escape(advancedCode.combined)}</div></div></div></section> <p class="mb-2 mt-24 text-center svelte-1uha8ag"><a href="https://github.com/khromov/svelte-render-scan" class="underline svelte-1uha8ag">GitHub</a></p> <p class="text-center text-gray-500 svelte-1uha8ag">© ${$.escape(new Date().getFullYear())} svelte-render-scan · Version ${$.escape(pkg.version)}</p> `);

		if (mounted) {
			$$renderer.push('<!--[0-->');

			RenderScan($$renderer, {
				callback: (m) => console.debug('Mutation observed!', m.type),
				duration: 1000
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}