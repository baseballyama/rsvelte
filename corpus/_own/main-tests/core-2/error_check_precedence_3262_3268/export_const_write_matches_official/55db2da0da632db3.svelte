<script>
	import { a } from './x.js';
	function f() { a = 2; }
</script>
<button onclick={f}>{a}</button>