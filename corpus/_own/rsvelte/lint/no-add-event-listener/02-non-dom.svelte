<script>
	function attach(emitter, bus) {
		emitter.addEventListener('data', () => {});
		bus.channel.addEventListener('msg', () => {});
		emitter?.addEventListener('later', () => {});
		emitter.addListener('data', () => {});
	}
</script>

<p>{typeof attach}</p>
