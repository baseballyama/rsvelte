<script lang="ts">
	import { alsoPresent } from './lib/exports';

	// a leading comment travels with the import when it is hoisted
	import { alsoMissing } from './lib/exports';

	const total = alsoPresent + alsoMissing;
</script>

<p>{total}</p>
