<script lang="ts">
	let a = $state(1);
	let b = $state(2);
	let v = $derived.by(function (): number { return a; });
</script>
