<script>
	export let box;
	export let texture;

	$: if (box) box.envMap = texture || null;

	function attach(camera) {
		box.envMap = camera.renderTarget.texture;
	}
</script>

<button onclick={() => attach(window.camera)}>attach</button>
