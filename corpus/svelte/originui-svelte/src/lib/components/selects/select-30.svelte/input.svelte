<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

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

	let value = $state('Europe/London');

	const selected = $derived(timezones.find((i) => i.value === value));

	const uid = $props.id();
</script>

<div class="space-y-2">
	<Label for={uid}>Timezone select</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger id={uid}>
			{selected?.label ?? 'Select a timezone'}
		</Select.Trigger>
		<Select.Content>
			{#each timezones as item (item.value)}
				<Select.Item value={item.value}>
					{item.label}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
