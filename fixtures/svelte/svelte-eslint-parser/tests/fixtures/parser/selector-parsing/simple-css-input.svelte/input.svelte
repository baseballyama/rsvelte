<script>
  let a = 10
</script>

<span class="myClass">Hello!</span>

<b>{a}</b>

<style>
  .myClass {
    color: red;
  }

  b {
    font-size: xx-large;
  }

  a:active,
  a::before,
  b + a,
  b + .myClass,
  a[data-key="value"] {
    color: blue;
  }
</style>
