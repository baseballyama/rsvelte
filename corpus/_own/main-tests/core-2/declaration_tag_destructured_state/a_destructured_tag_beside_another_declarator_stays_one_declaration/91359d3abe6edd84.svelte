{let [a] = $state([1]), b = $state(2), { c } = $derived({ c: a + b })}
<p>{a}{b}{c}</p>
<button onclick={() => { a++; b++; }}>x</button>
