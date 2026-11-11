<script>
	$: if (entity_id) {
		connection.subscribe((conn) => {
			conn
				.catch((error) => {
				});
		});
	}
</script>
