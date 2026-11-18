<script>
	let data = $state({ users: [{ name: 'a', greet: () => 'hi' }] });
	let key = $state('name');
</script>

<p>{data?.users?.[0]?.[key]}</p>
<p>{data.users[0]?.greet?.()}</p>
<p>{(data.users ?? []).length}</p>
<p>{data?.missing?.deeply?.nested ?? 'default'}</p>
<button onclick={() => delete data?.users?.[0]?.extra}>del</button>
<button onclick={() => data.users[0]?.greet()}>call</button>
