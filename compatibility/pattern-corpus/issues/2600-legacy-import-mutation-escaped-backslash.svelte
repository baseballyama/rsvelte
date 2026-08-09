<script>
  import { obj } from "./obj.js";

  export let label = "";

  function go() {
    obj.x = "\\";
  }

  function again() {
    obj.y = 1;
  }
</script>

<button onclick={go}>{label}{obj.x}</button>
<button onclick={again}>{obj.y}</button>
