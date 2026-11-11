<script>
	let n = 0;
	$inspect: {
		n = 1;
		break $inspect;
	}
	void n;
</script>
<p>{n}</p>
