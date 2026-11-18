<script>
	export let camera;
	export let id;

	$: if (camera) {
		camera.userData.id = id;
	}

	function change() {
		camera.userData.id = id;
	}
</script>

<button onclick={change}>change</button>
