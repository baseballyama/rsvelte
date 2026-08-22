<script>
  // class Decoy { export let hidden = 1; function ghost() {} } from "nowhere"
  const inString = "class Decoy { export let hidden = 1; } from 'nowhere'";
  const inTemplate = `class Decoy { $state( $derived( $props( } from "x"`;
  const inRegex = /class |export let |function | from |\$state\(/g;

  /*
   * class Decoy {
   *   export let hidden = 1;
   * }
   */
  let real = $state(1);
</script>

<b>{inString.length}{inTemplate.length}{inRegex.source.length}{real}</b>
<!-- class Decoy { export let hidden = 1; } -->
