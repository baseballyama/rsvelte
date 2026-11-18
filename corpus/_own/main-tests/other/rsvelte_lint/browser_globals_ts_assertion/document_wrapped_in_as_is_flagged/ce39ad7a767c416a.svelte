<script lang="ts">
	type Dir = "ltr" | "rtl";
	let dir: Dir = "ltr";
	if (document.dir) {
		dir = document.dir as Dir;
	}
</script>