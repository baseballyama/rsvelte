<script>
	let plain = 1,
		derivedToo = $derived(plain * 2);
	void [plain, derivedToo];
</script>
<p>one excluded declarator exempts the whole declaration upstream</p>
