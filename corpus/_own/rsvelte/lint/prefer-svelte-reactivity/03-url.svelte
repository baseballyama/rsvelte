<script>
	const u = new URL('https://a.example/');
	u.hash = '#x';
	const u2 = new URL('https://b.example/');
	const h = u2.hostname;
	const q = new URLSearchParams('a=1');
	q.append('b', '2');
	const q2 = new URLSearchParams('c=3');
	const c = q2.get('c');
	const u3 = new URL('https://c.example/');
	u3.search += '&d=4';
</script>

<p>{h} {c}</p>
