<script>
	const strict_equal = 'a' === 'a' ? 1 : 2;
	const strict_not_equal = 'a' !== 'a' ? 1 : 2;
	const loose_equal = '1' == 1 ? 1 : 2;
	const loose_not_equal = '1' != 1 ? 1 : 2;
</script>

<b>{strict_equal}</b>
<i>{strict_not_equal}</i>
<em>{loose_equal}</em>
<strong>{loose_not_equal}</strong>
<small>{'a' === 'a' ? 1 : 2}</small>
