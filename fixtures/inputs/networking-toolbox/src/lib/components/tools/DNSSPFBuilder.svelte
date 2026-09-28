<script lang="ts">
  import Icon from '$lib/components/global/Icon.svelte';
  import { tooltip } from '$lib/actions/tooltip';

  interface SPFMechanism {
    type: 'all' | 'include' | 'a' | 'mx' | 'ptr' | 'ip4' | 'ip6' | 'exists';
    qualifier: '+' | '-' | '~' | '?';
    value: string;
    enabled: boolean;
  }

  interface SPFModifier {
    type: 'redirect' | 'exp';
    value: string;
    enabled: boolean;
  }

  interface ValidationResult {
    isValid: boolean;
    messages: string[];
    warnings: string[];
    dnsLookups: number;
    recordLength: number;
  }

  let showExamples = $state(false);
  let selectedExample = $state<string | null>(null);

  // Button success states
  let buttonStates = $state<Record<string, boolean>>({});

  let mechanisms = $state<SPFMechanism[]>([
    { type: 'ip4', qualifier: '+', value: '', enabled: false },
    { type: 'ip6', qualifier: '+', value: '', enabled: false },
    { type: 'a', qualifier: '+', value: '', enabled: false },
    { type: 'mx', qualifier: '+', value: '', enabled: false },
    { type: 'include', qualifier: '+', value: '', enabled: false },
    { type: 'ptr', qualifier: '~', value: '', enabled: false },
    { type: 'exists', qualifier: '+', value: '', enabled: false },
    { type: 'all', qualifier: '~', value: '', enabled: true },
  ]);

  let modifiers = $state<SPFModifier[]>([
    { type: 'redirect', value: '', enabled: false },
    { type: 'exp', value: '', enabled: false },
  ]);

  const _qualifierLabels = {
    '+': 'Pass',
    '-': 'Fail',
    '~': 'SoftFail',
    '?': 'Neutral',
  };

  const mechanismDescriptions = {
    all: 'Matches all IPs (should be last)',
    include: 'Include another domains SPF record',
    a: 'Match A/AAAA records of domain',
    mx: 'Match MX records of domain',
    ptr: 'Match PTR records (discouraged)',
    ip4: 'Match specific IPv4 address/range',
    ip6: 'Match specific IPv6 address/range',
    exists: 'Check if domain exists',
  };

  const spfRecord = $derived.by(() => {
    const enabledMechanisms = mechanisms.filter((m) => m.enabled);
    const enabledModifiers = modifiers.filter((m) => m.enabled);

    let record = 'v=spf1';

    // Add mechanisms
    for (const mech of enabledMechanisms) {
      let mechString = '';

      if (mech.type === 'all') {
        mechString = `${mech.qualifier}all`;
      } else if (mech.type === 'a' || mech.type === 'mx' || mech.type === 'ptr') {
        mechString = `${mech.qualifier}${mech.type}`;
        if (mech.value.trim()) {
          mechString += `:${mech.value.trim()}`;
        }
      } else {
        if (mech.value.trim()) {
          mechString = `${mech.qualifier}${mech.type}:${mech.value.trim()}`;
        }
      }

      if (mechString) {
        record += ` ${mechString}`;
      }
    }

    // Add modifiers
    for (const mod of enabledModifiers) {
      if (mod.value.trim()) {
        record += ` ${mod.type}=${mod.value.trim()}`;
      }
    }

    return record;
  });

  const validation = $derived.by((): ValidationResult => {
    const enabledMechanisms = mechanisms.filter((m) => m.enabled);
    const _enabledModifiers = modifiers.filter((m) => m.enabled);
    const messages: string[] = [];
    const warnings: string[] = [];
    let dnsLookups = 0;

    // Check for required elements
    if (enabledMechanisms.length === 0) {
      messages.push('At least one mechanism must be enabled');
    }

    // Count DNS lookups
    for (const mech of enabledMechanisms) {
      if (['include', 'a', 'mx', 'exists'].includes(mech.type)) {
        dnsLookups++;
      }
      if (mech.type === 'ptr') {
        dnsLookups += 2; // PTR requires reverse and forward lookup
      }
    }

    // Check DNS lookup limit
    if (dnsLookups > 10) {
      messages.push(`Too many DNS lookups (${dnsLookups}). SPF limit is 10.`);
    } else if (dnsLookups > 8) {
      warnings.push(`High DNS lookup count (${dnsLookups}). Consider consolidating.`);
    }

    // Validate mechanism values
    for (const mech of enabledMechanisms) {
      if ((mech.type === 'include' || mech.type === 'exists') && !mech.value.trim()) {
        messages.push(`${mech.type} mechanism requires a domain value`);
      }

      if ((mech.type === 'ip4' || mech.type === 'ip6') && !mech.value.trim()) {
        messages.push(`${mech.type} mechanism requires an IP address`);
      }

      // Basic IP validation
      if (mech.type === 'ip4' && mech.value.trim()) {
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
        if (!ipv4Regex.test(mech.value.trim())) {
          messages.push(`Invalid IPv4 address/range: ${mech.value}`);
        }
      }

      if (mech.type === 'ip6' && mech.value.trim()) {
        // Basic IPv6 validation (simplified)
        if (!mech.value.includes(':')) {
          messages.push(`Invalid IPv6 address: ${mech.value}`);
        }
      }
    }

    // Check for 'all' mechanism position
    const allIndex = enabledMechanisms.findIndex((m) => m.type === 'all');
    if (allIndex >= 0 && allIndex < enabledMechanisms.length - 1) {
      warnings.push("'all' mechanism should typically be last");
    }

    // Check for PTR usage
    if (enabledMechanisms.some((m) => m.type === 'ptr')) {
      warnings.push('PTR mechanism is discouraged (slow and unreliable)');
    }

    // Check record length
    const recordLength = spfRecord.length;
    if (recordLength > 255) {
      messages.push(`SPF record too long (${recordLength} chars). DNS TXT limit is 255.`);
    } else if (recordLength > 200) {
      warnings.push(`SPF record is long (${recordLength} chars). Consider shortening.`);
    }

    // Check for conflicting modifiers
    const redirectEnabled = modifiers.find((m) => m.type === 'redirect' && m.enabled);
    if (redirectEnabled && enabledMechanisms.length > 0) {
      warnings.push('redirect modifier should not be used with mechanisms');
    }

    return {
      isValid: messages.length === 0,
      messages,
      warnings,
      dnsLookups,
      recordLength,
    };
  });

  function addCustomMechanism() {
    mechanisms.unshift({
      type: 'include',
      qualifier: '+',
      value: '',
      enabled: true,
    });
    mechanisms = mechanisms;
  }

  function removeMechanism(index: number) {
    mechanisms.splice(index, 1);
    mechanisms = mechanisms;
  }

  function showButtonSuccess(buttonId: string): void {
    buttonStates[buttonId] = true;
    setTimeout(() => {
      buttonStates[buttonId] = false;
    }, 2000);
  }

  function copyToClipboard(text: string, buttonId: string) {
    navigator.clipboard.writeText(text);
    showButtonSuccess(buttonId);
  }

  function exportAsZoneFile() {
    const zoneContent = `example.com. IN TXT "${spfRecord}"`;
    const blob = new Blob([zoneContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spf-record.zone';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showButtonSuccess('export-spf');
  }

  function loadExample(example: (typeof examplePolicies)[0]) {
    mechanisms = mechanisms.map((m) => ({ ...m, enabled: false }));

    for (const exampleMech of example.mechanisms) {
      const existing = mechanisms.find((m) => m.type === exampleMech.type && !m.enabled);
      if (existing) {
        existing.enabled = exampleMech.enabled;
        existing.qualifier = exampleMech.qualifier as SPFMechanism['qualifier'];
        existing.value = exampleMech.value;
      }
    }
    mechanisms = mechanisms;
    selectedExample = example.name;
  }

  const examplePolicies = [
    {
      name: 'Basic Email Provider',
      description: 'Simple SPF policy for Google Workspace',
      mechanisms: [
        { type: 'include', qualifier: '+', value: '_spf.google.com', enabled: true },
        { type: 'all', qualifier: '~', value: '', enabled: true },
      ],
    },
    {
      name: 'Multiple Providers',
      description: 'SPF policy for multiple email services',
      mechanisms: [
        { type: 'include', qualifier: '+', value: '_spf.google.com', enabled: true },
        { type: 'include', qualifier: '+', value: 'mailgun.org', enabled: true },
        { type: 'include', qualifier: '+', value: 'servers.mcsv.net', enabled: true },
        { type: 'all', qualifier: '~', value: '', enabled: true },
      ],
    },
    {
      name: 'Server + Provider',
      description: 'Dedicated server with email provider fallback',
      mechanisms: [
        { type: 'ip4', qualifier: '+', value: '203.0.113.1', enabled: true },
        { type: 'mx', qualifier: '+', value: '', enabled: true },
        { type: 'include', qualifier: '+', value: '_spf.google.com', enabled: true },
        { type: 'all', qualifier: '-', value: '', enabled: true },
      ],
    },
    {
      name: 'Strict Policy',
      description: 'Restrictive SPF policy with hard fail',
      mechanisms: [
        { type: 'ip4', qualifier: '+', value: '203.0.113.0/24', enabled: true },
        { type: 'include', qualifier: '+', value: '_spf.google.com', enabled: true },
        { type: 'all', qualifier: '-', value: '', enabled: true },
      ],
    },
  ];
</script>

<div class="card">
  <div class="card-header">
    <h1>SPF Policy Builder</h1>
    <p class="card-subtitle">
      Craft SPF (Sender Policy Framework) policies with mechanisms, qualifiers, and validation.
    </p>
  </div>

  <div class="grid-layout">
    <div class="input-section">
      <div class="mechanisms-section">
        <div class="section-header">
          <h3 use:tooltip={'Configure SPF mechanisms that define which servers can send email'}>
            <Icon name="settings" size="sm" />
            SPF Mechanisms
          </h3>
          <button type="button" class="add-btn" onclick={addCustomMechanism}>
            <Icon name="plus" size="sm" />
            Add Custom
          </button>
        </div>

        <div class="mechanisms-list">
          {#each mechanisms as mechanism, index (index)}
            <div class="mechanism-item" class:enabled={mechanism.enabled}>
              <div class="mechanism-header">
                <label class="mechanism-toggle">
                  <input type="checkbox" bind:checked={mechanism.enabled} />
                  <span class="mechanism-type">{mechanism.type.toUpperCase()}</span>
                  <span class="mechanism-description" use:tooltip={mechanismDescriptions[mechanism.type]}>
                    {mechanismDescriptions[mechanism.type]}
                  </span>
                </label>

                <div class="mechanism-controls">
                  <div class="qualifier-select">
                    <select bind:value={mechanism.qualifier} disabled={!mechanism.enabled}>
                      <option value="+">+ Pass</option>
                      <option value="-">- Fail</option>
                      <option value="~">~ SoftFail</option>
                      <option value="?">? Neutral</option>
                    </select>
                  </div>

                  {#if !['all', 'a', 'mx', 'ptr', 'ip4', 'ip6', 'include', 'exists'].includes(mechanism.type) || index < 3}
                    <button
                      type="button"
                      class="remove-btn"
                      onclick={() => removeMechanism(index)}
                      use:tooltip={'Remove this mechanism'}
                    >
                      <Icon name="x" size="sm" />
                    </button>
                  {/if}
                </div>
              </div>

              {#if !['all'].includes(mechanism.type)}
                <input
                  type="text"
                  bind:value={mechanism.value}
                  disabled={!mechanism.enabled}
                  placeholder={mechanism.type === 'ip4'
                    ? '203.0.113.1 or 203.0.113.0/24'
                    : mechanism.type === 'ip6'
                      ? '2001:db8::1 or 2001:db8::/32'
                      : mechanism.type === 'include'
                        ? '_spf.google.com'
                        : mechanism.type === 'exists'
                          ? 'check.example.com'
                          : 'domain.com (optional)'}
                  class="mechanism-input"
                />
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <div class="modifiers-section">
        <div class="section-header">
          <h3 use:tooltip={'Optional SPF modifiers for advanced configuration'}>
            <Icon name="wrench" size="sm" />
            SPF Modifiers
          </h3>
        </div>

        <div class="modifiers-list">
          {#each modifiers as modifier (modifier.type)}
            <div class="modifier-item" class:enabled={modifier.enabled}>
              <label class="modifier-toggle">
                <input type="checkbox" bind:checked={modifier.enabled} />
                <span class="modifier-type">{modifier.type}=</span>
              </label>

              <input
                type="text"
                bind:value={modifier.value}
                disabled={!modifier.enabled}
                placeholder={modifier.type === 'redirect' ? 'fallback.example.com' : 'explain.example.com'}
                class="modifier-input"
              />
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="results-section">
      <div class="spf-record-section">
        <div class="section-header">
          <h3>Generated SPF Record</h3>
          <div class="actions">
            <button
              type="button"
              class="copy-btn"
              class:success={buttonStates['copy-spf']}
              onclick={() => copyToClipboard(spfRecord, 'copy-spf')}
              use:tooltip={'Copy SPF record to clipboard'}
            >
              <Icon name={buttonStates['copy-spf'] ? 'check' : 'copy'} size="sm" />
              {buttonStates['copy-spf'] ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              class="export-btn"
              class:success={buttonStates['export-spf']}
              onclick={exportAsZoneFile}
              use:tooltip={'Download as zone file'}
            >
              <Icon name={buttonStates['export-spf'] ? 'check' : 'download'} size="sm" />
              {buttonStates['export-spf'] ? 'Downloaded!' : 'Export'}
            </button>
          </div>
        </div>

        <div class="record-output">
          <div class="code-block">
            <code>{spfRecord}</code>
          </div>
        </div>

        <div class="zone-file-output">
          <h4>Zone File Format:</h4>
          <div class="code-block">
            <code>example.com. IN TXT "{spfRecord}"</code>
          </div>
        </div>
      </div>

      <div class="validation-section">
        <div class="section-header">
          <h3>
            <Icon name="certified" size="sm" />
            Policy Validation
          </h3>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">DNS Lookups:</span>
            <span class="stat-value" class:warning={validation.dnsLookups > 8} class:error={validation.dnsLookups > 10}>
              {validation.dnsLookups}/10
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Record Length:</span>
            <span
              class="stat-value"
              class:warning={validation.recordLength > 200}
              class:error={validation.recordLength > 255}
            >
              {validation.recordLength}/255 chars
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Status:</span>
            <span class="stat-value" class:success={validation.isValid} class:error={!validation.isValid}>
              {validation.isValid ? 'Valid' : 'Invalid'}
            </span>
          </div>
        </div>

        {#if validation.messages.length > 0}
          <div class="validation-messages error">
            <Icon name="x-circle" size="sm" />
            <div class="messages">
              {#each validation.messages as message, index (index)}
                <div class="message">{message}</div>
              {/each}
            </div>
          </div>
        {/if}

        {#if validation.warnings.length > 0}
          <div class="validation-messages warning">
            <Icon name="alert-triangle" size="sm" />
            <div class="messages">
              {#each validation.warnings as warning, index (index)}
                <div class="message">{warning}</div>
              {/each}
            </div>
          </div>
        {/if}

        {#if validation.isValid && validation.messages.length === 0 && validation.warnings.length === 0}
          <div class="validation-messages success">
            <Icon name="check-circle" size="sm" />
            <div class="message">SPF policy is valid and ready to use!</div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="examples-section">
    <details class="examples-toggle" bind:open={showExamples}>
      <summary>
        <Icon name="lightbulb" size="sm" />
        Example Policies
      </summary>
      <div class="examples-grid">
        {#each examplePolicies as example (example.name)}
          <button
            type="button"
            class="example-card"
            class:selected={selectedExample === example.name}
            onclick={() => loadExample(example)}
          >
            <div class="example-header">
              <strong>{example.name}</strong>
            </div>
            <p class="example-description">{example.description}</p>
            <div class="example-preview">
              {example.mechanisms.map((m) => `${m.qualifier}${m.type}${m.value ? `:${m.value}` : ''}`).join(' ')}
            </div>
          </button>
        {/each}
      </div>
    </details>
  </div>
</div>

<style lang="scss">
  .mechanisms-section,
  .modifiers-section {
    margin-bottom: var(--spacing-lg);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    h3 {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin: 0;
      color: var(--color-text);
    }

    .actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-primary);
    color: var(--bg-secondary);
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--font-size-sm);
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--color-primary-hover);
    }
  }

  .mechanisms-list,
  .modifiers-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .mechanism-item,
  .modifier-item {
    padding: var(--spacing-sm);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-tertiary);
    opacity: 0.7;
    transition: all 0.2s ease;

    &.enabled {
      opacity: 1;
      border-style: solid;
      border-width: 1px;
      filter: brightness(1.1);
      border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    }
  }

  .mechanism-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-xs);
    }
  }

  .mechanism-toggle {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;
    flex: 1;
    min-width: 0;

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      accent-color: var(--color-primary);
      flex-shrink: 0;
    }

    .mechanism-type {
      font-weight: 600;
      font-family: var(--font-mono);
      color: var(--color-primary);
      min-width: 65px;
      flex-shrink: 0;
    }

    .mechanism-description {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      font-style: italic;
      margin-left: var(--spacing-xs);
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .mechanism-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex-shrink: 0;
  }

  .qualifier-select select {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-background);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    cursor: pointer;
    min-width: 100px;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      border-color: var(--color-primary);
    }

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-bg);
    }

    &:disabled {
      background: var(--color-surface-disabled);
      color: var(--color-text-disabled);
      cursor: not-allowed;
    }
  }

  .mechanism-input {
    width: 100%;
    padding: var(--spacing-xs);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);

    &:disabled {
      background: var(--color-surface-disabled);
      color: var(--color-text-disabled);
    }
  }

  .remove-btn {
    padding: var(--spacing-xs);
    background: var(--color-error);
    color: var(--bg-secondary);
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0.7;
    width: 24px;
    height: 24px;

    &:hover {
      background: var(--color-error-light);
      opacity: 1;
      transform: scale(1.05);
    }
  }

  .modifier-toggle {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      accent-color: var(--color-primary);
    }

    .modifier-type {
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--color-primary);
      min-width: 80px;
    }
  }

  .modifier-input {
    flex: 1;
    padding: var(--spacing-xs);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);

    &:disabled {
      background: var(--color-surface-disabled);
      color: var(--color-text-disabled);
    }
  }

  .spf-record-section,
  .validation-section {
    margin-bottom: var(--spacing-lg);
  }

  .record-output {
    margin-bottom: var(--spacing-md);
  }

  .zone-file-output {
    h4 {
      margin: 0 0 var(--spacing-xs) 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
  }

  .code-block {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);

    &:last-child {
      margin-bottom: 0;
    }

    code {
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      word-break: break-all;
      display: block;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs);
    background: var(--color-surface);
    border-radius: var(--radius-sm);
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .stat-value {
    font-weight: 600;
    font-family: var(--font-mono);

    &.success {
      color: var(--color-success);
    }

    &.warning {
      color: var(--color-warning);
    }

    &.error {
      color: var(--color-error);
    }
  }

  .validation-messages {
    display: flex;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-sm);

    &:last-child {
      margin-bottom: 0;
    }

    &.success {
      background: var(--color-success-bg);
      border: 1px solid var(--color-success);
      color: var(--color-success);
    }

    &.warning {
      background: var(--color-warning-bg);
      border: 1px solid var(--color-warning);
      color: var(--color-warning);
    }

    &.error {
      background: var(--color-error-bg);
      border: 1px solid var(--color-error);
      color: var(--color-error);
    }
  }

  .messages {
    flex: 1;
  }

  .message {
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xs);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .examples-section {
    margin-top: var(--spacing-lg);
  }

  .examples-toggle {
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm);

    summary {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      cursor: pointer;
      border: 1px solid var(--color-border);

      &:hover {
        background: var(--color-surface-variant);
      }
    }
  }

  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .example-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    background: var(--color-surface);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
      background: var(--color-surface-variant);
      border-color: var(--color-primary);
    }

    &.selected {
      border-color: var(--color-primary);
      background: var(--color-primary-bg);
    }

    .example-header {
      width: 100%;
      strong {
        color: var(--color-primary);
        font-size: var(--font-size-sm);
      }
    }

    .example-description {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      width: 100%;
    }

    .example-preview {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      font-family: var(--font-mono);
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .copy-btn,
  .export-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-primary);
    color: var(--bg-secondary);
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--font-size-sm);
    transition: all 0.3s ease;
    transform: scale(1);

    &:hover {
      background: var(--color-primary-hover);
    }

    &.success {
      background: var(--color-success) !important;
      color: var(--bg-secondary) !important;
      transform: scale(1.05);

      &:hover {
        background: var(--color-success) !important;
      }
    }
  }

  .export-btn {
    background: var(--color-success);

    &:hover {
      background: var(--color-success-hover);
    }
  }
</style>
