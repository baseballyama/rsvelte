<script lang="ts">
	import Exports, { answer, double, type Answer } from './exports.svelte';

	const doubled: Answer = double(answer);
	const label: string = answer;
</script>

<Exports />
<p>{doubled} {label}</p>
