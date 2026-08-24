<script>
	class K {
		static seen = 0;
		static {
			let r = $state(4);
			K.seen = r;
		}
	}
</script>

<p>{K.seen}</p>
