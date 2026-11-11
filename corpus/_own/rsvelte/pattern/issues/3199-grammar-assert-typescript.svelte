<script lang="ts">
	import data from './data.json' assert { type: 'json' };

	const held: unknown = data;
</script>

<b>{typeof held}</b>
