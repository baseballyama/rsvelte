<script lang="ts">
	let a = $state(1);
	let b = $state(2);
	let v = $derived.by((): a is number => true);
</script>
