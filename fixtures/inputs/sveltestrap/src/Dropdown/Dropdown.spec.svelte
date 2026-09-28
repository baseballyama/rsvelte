<script>
  import Dropdown from './Dropdown.svelte';
  import { DropdownMenu } from '../DropdownMenu';
  import { DropdownItem } from '../DropdownItem';
  import { DropdownToggle } from '../DropdownToggle';
</script>

<Dropdown>
  <DropdownToggle caret class="coconut">Open</DropdownToggle>
  <DropdownMenu class="cocoa">
    <DropdownItem>Alpha</DropdownItem>
  </DropdownMenu>
</Dropdown>
