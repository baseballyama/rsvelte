<script>
	const holder = { $inspect: 1, other: 2 };
	const { $inspect, other } = holder;
	const { $inspect: renamed } = holder;
	void [$inspect, other, renamed];
</script>
<p>shorthand destructuring</p>
