<script>
	$: if (entity_id) {
		connection.subscribe((conn) => {
			// lead
			conn.catch((error) => {
			});
		});
	}
</script>
