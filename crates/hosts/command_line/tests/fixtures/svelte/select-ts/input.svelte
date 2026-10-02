<script lang="ts">
	let size: number = $state(1);
	let name: string = $state('a');
</script>

<select value={size} onchange={(e) => (size = e.currentTarget.selectedIndex)}>
	<option value={1}>small</option>
	<option value={2}>large</option>
</select>
<select value={name.toFixed(1)}>
	<option>{name}</option>
</select>
