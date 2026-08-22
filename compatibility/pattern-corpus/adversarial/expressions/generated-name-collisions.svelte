<script>
  let root = $state(1);
  let text = $state(2);
  let fragment = $state(3);
  let node = $state(4);
  let anchor = $state(5);
  let div = $state(6);
  let span = $state(7);
  let event = $state(8);
</script>

<div>{root}</div>
<span>{text}</span>
<div>{fragment}{node}</div>
<span>{anchor}{div}{span}</span>
<button onclick={() => (event += 1)}>{event}</button>
