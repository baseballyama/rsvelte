<script lang="ts">
	import { onMount } from 'svelte';
	import Eye from '$lib/components/Logo.svelte';
	import pkg from '../../package.json' assert { type: 'json' };
	import RenderScan from '$lib/components/RenderScan.svelte';

	// Interactive demo state
	let highlightColor = $state('#2189b5'); // Changed to Sea Green
	let mounted = $state(false);
	let boxes = $state<number[]>([]);
	let maxBoxes = 3;
	let isAnimating = $state(false);
	let logoVisible = $state(false);

	// Animate logo after a small delay when component mounts
	onMount(() => {
		// Delay the mounting of the render-scan component to avoid a flash on load
		setTimeout(() => {
			mounted = true;
		}, 100);
		logoVisible = true;
	});

	// Calculate text color based on background brightness
	function calculateBrightness(hexColor: string): number {
		// Remove # if present
		const color = hexColor.replace('#', '');
		const r = parseInt(color.substring(0, 2), 16);
		const g = parseInt(color.substring(2, 4), 16);
		const b = parseInt(color.substring(4, 6), 16);
		// Calculate perceived brightness using relative luminance
		return (r * 299 + g * 587 + b * 114) / 1000;
	}

	let textColor = $derived.by(() => {
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
	let installer = $state(installers[0].name);

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
</script>

<div class="border-b-4 bg-[#faf6f4] py-12">
	<div class="container mx-auto flex max-w-xl flex-col items-center text-center">
		<!-- Logo Eye Icon -->
		<div
			class="mb-4 transition-all duration-700"
			class:opacity-0={!logoVisible}
			class:translate-y-4={!logoVisible}
			style:color={highlightColor}
		>
			<Eye
				size={128}
				class="animate-[spin_1s_ease-in-out] hover:animate-[spin_1s_ease-in-out]"
				strokeWidth={1.5}
			/>
		</div>

		<div
			class="mb-10 flex flex-col items-center space-y-3 text-white md:flex-row md:space-x-3 md:space-y-0"
		>
			<div
				class="-rotate-2 rounded-xl bg-[#322f35] p-4 text-xl font-extrabold uppercase tracking-widest shadow-lg md:text-2xl"
			>
				Svelte
			</div>
			<div
				class="rotate-3 rounded-xl p-4 text-xl font-extrabold uppercase tracking-widest shadow-lg md:text-2xl"
				style="background-color: {highlightColor}; color: {textColor}"
			>
				Render
			</div>
			<div
				class="-rotate-2 rounded-xl bg-[#322f35] p-4 text-xl font-extrabold uppercase tracking-widest shadow-lg md:text-2xl"
			>
				Scan
			</div>
		</div>
		<h1 class="text-3xl font-bold md:text-5xl">Visual debugging for Svelte apps</h1>
		<p class="mxy-4 mt-10 max-w-prose px-4 py-2 text-lg md:text-xl">
			Watch your components update in real-time. Perfect for debugging reactivity and performance
			issues.
		</p>

		<!-- Interactive Demo Section -->
		<div class="px-4 sm:px-0">
			<div class="mt-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-lg font-bold">See DOM Updates Live</h2>
				<p class="mb-6 italic text-gray-600">
					Try switching the highlight colors on this page below!
				</p>

				<div class="space-y-6">
					<!-- Color Picker -->
					<div class="flex items-center justify-between">
						<label for="highlight-color" class="font-medium">Page Highlight Color</label>
						<input type="color" id="highlight-color" bind:value={highlightColor} class="h-8 w-12" />
					</div>

					<!-- Demo Section -->
					<div class="space-y-4">
						<div class="flex justify-center">
							<button
								onclick={demonstrateRendering}
								disabled={isAnimating}
								class="flex items-center space-x-2 rounded-xl border-2 border-amber-400 bg-amber-300 px-5 py-2 text-lg font-bold shadow transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
										clip-rule="evenodd"
									/>
								</svg>
								<span>See it in action</span>
							</button>
						</div>
						<!-- Demo Boxes -->
						<div class="flex justify-center space-x-4">
							{#each boxes as box (box)}
								<div
									class="h-16 w-16 rounded-lg transition-all duration-300"
									style="background-color: {highlightColor}"
								></div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="mt-10 grid grid-cols-1 gap-4 self-stretch font-medium sm:grid-cols-3">
			{#each ['Track DOM Updates', 'Debug Re-renders', 'Visual Feedback'] as feature}
				<div
					class="flex items-center justify-center space-x-2 text-center sm:justify-start sm:text-left"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke={highlightColor}
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
					>
					<p>{feature}</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="container mx-auto max-w-2xl px-4 py-10">
	<section>
		<div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<p class="text-xl font-bold">Install</p>
			<div class="space-x-1">
				{#each installers as i}
					<label for={i.name} class:checked={i.name === installer}>
						<input
							type="radio"
							id={i.name}
							name="installers"
							value={i.name}
							bind:group={installer}
						/>
						<span
							style="background-color: {i.name === installer
								? highlightColor
								: ''}; color: {i.name === installer ? textColor : ''}">{i.name}</span
						>
					</label>
				{/each}
			</div>
		</div>
		{#each installers as i}
			<div class:hidden={installer !== i.name}>
				<div class="code-block">{i.cmd}</div>
			</div>
		{/each}
	</section>

	<section class="mt-10">
		<p class="mb-4 text-xl font-bold">SvelteKit</p>
		<p class="mb-4">Add to your root +layout.svelte file to enable the component in all pages:</p>
		<div class="code-block">{demoSvelteKitCode}</div>
	</section>

	<section class="mt-10">
		<p class="mb-4 text-xl font-bold">Vanilla Svelte</p>
		<div class="code-block">{demoCode}</div>
	</section>

	<section class="mt-16">
		<h2 class="mb-6 text-xl font-bold">Advanced Usage</h2>

		<div class="space-y-8">
			<div>
				<h3 class="mb-2 font-bold">Start Disabled</h3>
				<p class="mb-3 text-gray-600">Start with render scanning disabled by default:</p>
				<div class="code-block">{advancedCode.disable}</div>
			</div>

			<div>
				<h3 class="mb-2 font-bold">Adjust Position</h3>
				<p class="mb-3 text-gray-600">
					Move the button left to avoid overlapping with other UI elements:
				</p>
				<div class="code-block">{advancedCode.offset}</div>
			</div>

			<div>
				<h3 class="mb-2 font-bold">Hide Icon</h3>
				<p class="mb-3 text-gray-600">
					Hide the render scan button while keeping functionality active:
				</p>
				<div class="code-block">{`<RenderScan hideIcon={true} />`}</div>
			</div>

			<div>
				<h3 class="mb-2 font-bold">Highlight Duration</h3>
				<p class="mb-3 text-gray-600">
					Adjust how long the render scan highlights remain on screen (default=1000):
				</p>
				<div class="code-block">{`<RenderScan duration={2000} />`}</div>
			</div>

			<div>
				<h3 class="mb-2 font-bold">Callback Function</h3>
				<p class="mb-3 text-gray-600">
					Optional user defined function that gets called once per valid mutation:
				</p>
				<div class="code-block">{callbackCode}</div>
			</div>

			<div>
				<h3 class="mb-2 font-bold">Combined Props</h3>
				<p class="mb-3 text-gray-600">Use multiple props together:</p>
				<div class="code-block">{advancedCode.combined}</div>
			</div>
		</div>
	</section>

	<p class="mb-2 mt-24 text-center">
		<a href="https://github.com/khromov/svelte-render-scan" class="underline">GitHub</a>
	</p>
	<p class="text-center text-gray-500">
		© {new Date().getFullYear()} svelte-render-scan · Version {pkg.version}
	</p>

	{#if mounted}
		<RenderScan callback={(m) => console.debug('Mutation observed!', m.type)} duration={1000} />
	{/if}
</div>

<style lang="postcss">
	.code-block {
		@apply block w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-gray-100 p-5 font-mono text-sm;
	}

	input[type='radio'] {
		@apply hidden appearance-none;
	}

	label {
		cursor: pointer;
		@apply rounded-full px-3 py-1;
	}

	label.checked {
		@apply font-bold;
	}

	label.checked span {
		@apply rounded-full px-3 py-1;
	}

	input[type='color'] {
		@apply cursor-pointer rounded border border-gray-200;
	}

	:global(.animate-\[spin_1s_ease-in-out\]) {
		animation: spin 1s ease-in-out;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
