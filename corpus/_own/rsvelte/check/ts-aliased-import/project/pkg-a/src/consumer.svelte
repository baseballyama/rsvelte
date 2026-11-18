<script lang="ts">
	import { Store } from './store';
	import { emptyRow } from './named';

	const store = new Store();
</script>

<p>{store.table === null}{emptyRow.id}</p>
