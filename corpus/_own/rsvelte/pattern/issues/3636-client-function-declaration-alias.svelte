<script>
	function declared() {
		return 1;
	}

	const function_alias = declared;
	const arrow = () => 2;
	const plain = 3;
	const plain_alias = plain;
</script>

<b>{function_alias}</b>
<i>{arrow}</i>
<span>{plain_alias}</span>
<em>{typeof declared}</em>
