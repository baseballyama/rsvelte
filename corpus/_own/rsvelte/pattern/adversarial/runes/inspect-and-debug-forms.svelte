<script>
  let a = $state(1);
  let b = $state(2);

  $inspect(a);
  $inspect(a, b);
  $inspect(a).with((type, value) => {
    void type;
    void value;
  });
</script>

{@debug}
{@debug a}
{@debug a, b}
<b>{a}{b}</b>
