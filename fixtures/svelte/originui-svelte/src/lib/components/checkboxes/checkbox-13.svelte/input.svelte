<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import Label from '$lib/components/ui/label.svelte';

	const uid = $props.id();
</script>

<div
	class="border-input has-data-[state=checked]:border-ring relative flex w-full items-start gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]"
>
	<Checkbox
		id={uid}
		class="order-1 after:absolute after:inset-0"
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
