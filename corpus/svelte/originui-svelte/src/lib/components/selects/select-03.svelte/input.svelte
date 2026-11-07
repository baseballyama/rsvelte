<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import SelectNative from '$lib/components/ui/select-native.svelte';

	import Clock from '@lucide/svelte/icons/clock';

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Select with icon (native)</Label>
	<div class="group relative">
		<SelectNative id={uid} class="ps-9">
			<option value="s1">00:00 AM - 11:59 PM</option>
			<option value="s2">01:00 AM - 12:59 PM</option>
			<option value="s3">02:00 AM - 01:59 PM</option>
			<option value="s4">03:00 AM - 02:59 PM</option>
		</SelectNative>
		<div
			class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[[disabled]]:opacity-50"
		>
			<Clock size={16} aria-hidden="true" />
		</div>
	</div>
</div>
