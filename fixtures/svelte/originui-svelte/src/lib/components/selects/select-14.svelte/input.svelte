<script lang="ts">
	import SelectNative from '$lib/components/ui/select-native.svelte';

	const uid = $props.id();
</script>

<div
	class="border-input bg-background focus-within:border-ring focus-within:ring-ring/20 relative rounded-lg border shadow-xs shadow-black/5 transition-shadow focus-within:ring-[3px] focus-within:outline-hidden has-[select:disabled]:cursor-not-allowed has-[select:disabled]:opacity-50 [&:has(select:is(:disabled))_*]:pointer-events-none"
>
	<label for={uid} class="text-foreground block px-3 pt-2 text-xs font-medium">
		Select with inset label (native)
	</label>
	<SelectNative
		id={uid}
		class="border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
	>
		<option value="" disabled selected> Select framework </option>
		<option value="s1">Svelte</option>
		<option value="s2">Next.js</option>
		<option value="s3">Astro</option>
		<option value="s4">Gatsby</option>
	</SelectNative>
</div>
