<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Switch from '$lib/components/ui/switch.svelte';

	let checked = $state(false);

	const uid = $props.id();
</script>

<div
	class="border-input has-data-[state=checked]:border-ring relative flex w-full items-start gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]"
>
	<Switch
		id={uid}
		bind:checked
		class="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
		aria-describedby="{uid}-description"
	/>
	<div class="grid grow gap-2">
		<Label for={uid}>
			Label
			<span class="text-muted-foreground text-xs leading-[inherit] font-normal"> (Sublabel) </span>
		</Label>
		<p id="{uid}-description" class="text-muted-foreground text-xs">
			A short description goes here.
		</p>
	</div>
</div>
