<script>
	import { data } from './d.js';
	let g = $state([]);
	export function go() { ({ g } = data); }
</script>
<p>{g}</p>
