<script>
  let on = $state(true);
  const table = { a: true, b: false };
  const list = ["x", "y"];
</script>

<div class="static"></div>
<div class={"expression"}></div>
<div class={table}></div>
<div class={list}></div>
<div class={[list, table, "literal", on && "conditional"]}></div>
<div class={{ a: on, "b-c": !on }}></div>
<div class="static {on ? 'a' : 'b'} tail"></div>
<div class:toggled={on} class="static"></div>

<div style="color: red"></div>
<div style="color: {on ? 'red' : 'blue'}"></div>
<div style:color={on ? "red" : "blue"}></div>
<div style:color style:--custom="1"></div>
<div style="color: red" style:background="blue"></div>

<style>
  .static {
    color: red;
  }

  .toggled {
    color: blue;
  }
</style>
