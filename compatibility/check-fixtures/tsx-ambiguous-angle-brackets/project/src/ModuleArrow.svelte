<script module lang="ts">
	export const shared = <T>(x: T) => x; export const wrong: boolean = shared(1);
</script>

<script lang="ts">
	const local = shared('x');
</script>

<p>{local}{wrong}</p>
