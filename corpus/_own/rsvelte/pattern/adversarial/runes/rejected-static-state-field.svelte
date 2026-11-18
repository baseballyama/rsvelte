<script>
	class Counter {
		static instances = $state(0);
	}
	const c = new Counter();
</script>

<p>{Counter.instances}{c ? '' : ''}</p>
