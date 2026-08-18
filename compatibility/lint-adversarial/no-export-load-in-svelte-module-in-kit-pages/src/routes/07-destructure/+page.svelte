<script context="module">
	export const { load } = { load: 1 };
	export const [loadFromArray] = [1];
	void [load, loadFromArray];
</script>
<p>destructure exports are not flagged upstream</p>
