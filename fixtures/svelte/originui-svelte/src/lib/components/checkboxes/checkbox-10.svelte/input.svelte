<script lang="ts">
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import Label from '$lib/components/ui/label.svelte';

	const uid = $props.id();
</script>

<div class="flex items-start gap-2">
	<Checkbox id={uid} aria-describedby="{uid}-description" />
	<div class="grid grow gap-2">
		<Label for={uid}>
			Label
			<span class="text-muted-foreground text-xs leading-[inherit] font-normal"> (Sublabel) </span>
		</Label>
		<p id="{uid}-description" class="text-muted-foreground text-xs">
			You can use this checkbox with a label and a description.
		</p>
	</div>
</div>
