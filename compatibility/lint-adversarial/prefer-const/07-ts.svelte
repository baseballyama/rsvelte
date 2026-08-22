<script lang="ts">
	let annotated: number = 1;
	let casted = 1 as const;
	let assigned: string | null = null;
	assigned = 'x';
	void [annotated, casted, assigned];
</script>
<p>ts</p>
