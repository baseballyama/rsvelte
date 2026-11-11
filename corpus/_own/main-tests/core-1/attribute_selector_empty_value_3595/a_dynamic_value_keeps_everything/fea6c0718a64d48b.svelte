<script>
	let v = "x";
</script>

<a href="#" data-flag={v}>a</a>

<style>
	a[data-flag~=""] { color: red; }
</style>
