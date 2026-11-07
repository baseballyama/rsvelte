<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import SelectNative from '$lib/components/ui/select-native.svelte';

	const timezones = Intl.supportedValuesOf('timeZone')
		.map((timezone) => {
			const formatter = new Intl.DateTimeFormat('en', {
				timeZone: timezone,
				timeZoneName: 'shortOffset'
			});
			const parts = formatter.formatToParts(new Date());
			const offset = parts.find((part) => part.type === 'timeZoneName')?.value || '';
			const modifiedOffset = offset === 'GMT' ? 'GMT+0' : offset;

			return {
				label: `(${modifiedOffset}) ${timezone.replace(/_/g, ' ')}`,
				numericOffset: parseInt(offset.replace('GMT', '').replace('+', '') || '0'),
				value: timezone
			};
		})
		.sort((a, b) => a.numericOffset - b.numericOffset);

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Timezone select (native)</Label>
	<SelectNative id={uid}>
		{#each timezones as item (item.value)}
			<option value={item.value} selected={item.value == 'Europe/London'}>
				{item.label}
			</option>
		{/each}
	</SelectNative>
</div>
