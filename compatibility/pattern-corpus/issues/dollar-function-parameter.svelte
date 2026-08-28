<script lang="ts">
	let work = $state({ value: 1 });

	function read($work: { value: number }) {
		return $work.value;
	}

	const viewport = {
		update(fn: (value: { width: number }) => void) {
			fn({ width: 1 });
		}
	};

	viewport.update(($viewport) => {
		$viewport.width += read(work);
	});
</script>

<p>{read(work)}</p>
