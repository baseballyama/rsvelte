<script>
	export let count;
	let obj, klass, arr;
	$: obj = {
		m() {
			return count;
		}
	};
	$: klass = class {
		m() {
			return count;
		}
	};
	$: arr = [() => count];
</script>

{typeof obj}{typeof klass}{arr.length}
