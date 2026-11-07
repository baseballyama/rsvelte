<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group/index.js';

	let value = $state('left');
</script>

<ToggleGroup type="single" variant="outline" bind:value>
	<ToggleGroupItem class="flex-1" value="left">Left</ToggleGroupItem>
	<ToggleGroupItem class="flex-1" value="center">Center</ToggleGroupItem>
	<ToggleGroupItem class="flex-1" value="right">Right</ToggleGroupItem>
</ToggleGroup>
