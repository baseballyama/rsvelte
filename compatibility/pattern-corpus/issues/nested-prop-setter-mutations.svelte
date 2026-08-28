<script>
	export let props = {};

	props.createDrawing = async () => {
		if (props.drawings) {
			props.drawings = [1, ...props.drawings];
		} else {
			props.drawings = [1];
		}
	};
</script>
