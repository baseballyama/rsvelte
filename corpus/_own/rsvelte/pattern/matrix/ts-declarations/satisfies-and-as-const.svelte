<script lang="ts">
	const config = { mode: 'dark' } satisfies Record<string, string>;
	const modes = ['light', 'dark'] as const;
</script>

<p>{config.mode}{modes.length}</p>
