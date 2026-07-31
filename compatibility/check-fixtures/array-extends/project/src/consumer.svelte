<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { thing } from '$lib/thing';

	const label: string = env.PUBLIC_LABEL;
</script>

<p>{label} {thing}</p>
