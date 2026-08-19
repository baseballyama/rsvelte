<script>
	const key = '$inspect';
	const holder = { [key]: 1 };
	const a = holder?.$inspect;
	const b = holder['$inspect'];
	const c = holder[$inspect];
	void [a, b, c];
</script>
<p>computed access</p>
