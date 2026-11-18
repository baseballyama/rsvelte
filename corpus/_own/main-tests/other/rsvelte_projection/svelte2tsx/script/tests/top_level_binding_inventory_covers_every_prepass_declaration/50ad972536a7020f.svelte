<script lang="ts">
import default_import, { named as aliased_import } from "pkg";
import * as namespace_import from "other";
var plain_var;
let plain_let = 1;
const plain_const = 2;
function plain_function() {}
class PlainClass {}
namespace PlainNamespace {}
enum PlainEnum { Value }
export let exported_var = 3;
export function exported_function() {}
export class ExportedClass {}
</script>