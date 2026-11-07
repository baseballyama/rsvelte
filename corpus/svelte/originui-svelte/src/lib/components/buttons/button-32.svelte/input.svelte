<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group/index.js';
</script>

<ToggleGroup variant="outline" class="inline-flex" type="single">
	<ToggleGroupItem value="left">Left</ToggleGroupItem>
	<ToggleGroupItem value="center">Center</ToggleGroupItem>
	<ToggleGroupItem value="right">Right</ToggleGroupItem>
</ToggleGroup>
