<script>
	let doc;
	let icon;
	let value;
	const priorities = [{ icon: "low" }];

	function query(callback) {
		callback([1]);
	}

	$: value && query((res) => {
		;[doc] = res
	});
	$: if (value) ({ icon } = priorities[value]);
</script>

<p>{doc} {icon}</p>
