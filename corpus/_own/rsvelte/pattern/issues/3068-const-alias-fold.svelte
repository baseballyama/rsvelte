<script module>
	export const K = 1;
	const LOCAL = 'x';
</script>

<script>
	const INSTANCE = 2;
	let a = K;
	let b = $state(K);
	let c = $state.raw(LOCAL);
	let d = INSTANCE;
	let alias = K;
	let chained = alias;
</script>

<p>{a}{b}{c}{d}{chained}</p>
