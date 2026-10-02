<script>
  // Vue's toDisplayString: objects and arrays as indented JSON, null and undefined as nothing.
  const object = { a: 1, b: [true, null] };
  const list = ['x', 'y'];
  const nothing = undefined;
</script>

<pre>{JSON.stringify(object, null, 2)}</pre>
<p>{JSON.stringify(list, null, 2)}</p>
<p>[{nothing}] [{null}]</p>
