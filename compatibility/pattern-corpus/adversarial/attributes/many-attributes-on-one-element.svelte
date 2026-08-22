<script>
  let v = $state(1);
  const spread = { "data-spread": 1 };
</script>

<a
  href="/a"
  target="_blank"
  rel="noopener noreferrer"
  id="one"
  class="two three"
  title={v}
  lang="en"
  dir="ltr"
  hidden={false}
  tabindex="0"
  role="link"
  aria-label="l"
  aria-hidden="false"
  data-plain="p"
  data-interpolated="{v}-x"
  data-template={`t${v}`}
  data-ternary={v ? "y" : "n"}
  data-nullish={v ?? "d"}
  data-unary={-v}
  data-member={spread["data-spread"]}
  {...spread}
  style:color="red"
  class:active={v}
  onclick={() => (v += 1)}
  onmouseenter={() => {}}
>
  {v}
</a>

<style>
  .active {
    color: blue;
  }
</style>
