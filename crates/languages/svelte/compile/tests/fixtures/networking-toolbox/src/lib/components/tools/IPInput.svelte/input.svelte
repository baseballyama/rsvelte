<script lang="ts">
  import { validateIPv4 } from '$lib/utils/ip-validation.js';
  import type { ValidationResult } from '$lib/types/ip.js';
  import SvgIcon from '$lib/components/global/SvgIcon.svelte';

  interface Props {
    value?: string;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = '192.168.1.1',
    label = 'IP Address',
    required = false,
    disabled = false,
    class: className = '',
  }: Props = $props();

  let validation: ValidationResult = $state({ valid: true });
  let focused = $state(false);

  /**
   * Validates input on change
   */
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    validation = validateIPv4(value);
  }

  /**
   * Formats IP address as user types
   */
  function _formatIP(ip: string): string {
    return ip.replace(/[^0-9.]/g, '');
  }
</script>

<div class="form-field {className}">
  {#if label}
    <label for="ip-input">
      {label}
      {#if required}<span class="required">*</span>{/if}
    </label>
  {/if}

  <div class="field-input">
    <input
      id="ip-input"
      type="text"
      {value}
      {placeholder}
      {required}
      {disabled}
      class="input-ip"
      class:valid={validation.valid && value}
      class:invalid={!validation.valid && value}
      class:focused
      oninput={handleInput}
      onfocus={() => (focused = true)}
      onblur={() => (focused = false)}
    />

    <!-- Validation indicator -->
    <div class="field-icon">
      {#if value && validation.valid}
        <div class="status-icon success">
          <SvgIcon icon="check" size="sm" />
        </div>
      {:else if value && !validation.valid}
        <div class="status-icon error">
          <SvgIcon icon="close" size="sm" />
        </div>
      {/if}
    </div>
  </div>

  <!-- Error message -->
  {#if !validation.valid && validation.error}
    <p class="field-error fade-in">
      {validation.error}
    </p>
  {/if}

  <!-- Helper text -->
  {#if validation.valid && value}
    <p class="field-help">Valid IPv4 address format</p>
  {/if}
</div>

<style lang="scss">
  .input-ip {
    font-family: var(--font-mono);
    font-size: var(--font-size-lg);
    padding-right: 2.5rem;
    flex: 1;

    &.valid {
      border-color: var(--color-success);
    }

    &.invalid {
      border-color: var(--color-error);
    }

    &.focused {
      box-shadow: var(--shadow-md);
    }
  }
</style>
