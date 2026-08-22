<script module>
	export const load = () => ({ props: {} });
</script>

<script>
	let { class: klass } = $props();
</script>

<p class={klass}>x</p>
