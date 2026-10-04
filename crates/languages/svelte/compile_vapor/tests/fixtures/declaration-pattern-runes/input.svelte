<script>let outside = $state({ value: 10 });</script>
{let { count = 1, nested: { value = 2 } } = $state({ nested: {} })}
{let [double, triple] = $derived([count * 2, count * 3])}
<button onclick={() => { count++; value++; outside.value++; }}>update</button>
<p>{count}:{value}:{double}:{triple}:{outside.value}</p>
