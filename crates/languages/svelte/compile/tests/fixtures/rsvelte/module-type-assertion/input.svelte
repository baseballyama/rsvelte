<script module lang="ts">
	export const wrap = <T>(value: T) => <Box<T>>(() => <Inner<T>>value);
	const n = <number>(<unknown>"text");
	function f() {
		return <Missing>n;
	}
</script>

<script lang="ts">
	let kept = <string>(<unknown>1);
</script>

<p>{kept}</p>
