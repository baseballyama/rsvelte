<script>
  let plain = 0;
  const object = { count: 0 };
  let raw = $state.raw({ count: 0 });
  let reactive = $state(0);
  function read() { return plain; }
  function mutate() { plain++; object.count++; raw.count++; }
</script>
<button onclick={mutate}>mutate</button>
<button onclick={() => reactive++}>render</button>
<p title={plain}>{plain}</p>
<p>{object.count}</p>
<p>{raw.count}</p>
<p>{read()}</p>
<p>{plain}:{object.count}:{raw.count}:{read()}:{reactive}</p>
<p class:active={plain > 0} style:color={plain > 0 ? 'red' : 'blue'}>directives</p>
<p {...{ title: plain }}>spread</p>
<p title={read()} data-call="read">{read()}</p>
<p title="call:{read()}" class:called={read() > 0} style:opacity={read() > 0 ? 1 : 0.5}>calls</p>
