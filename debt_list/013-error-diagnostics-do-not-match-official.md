# P1 — compile-error messages and spans remain substantially incompatible

Category: diagnostics / tooling compatibility

Evidence: among 2,843 comparable error pairs, message ratchets contain 121/121/120 ids, start-position ratchets 226 each, and end-position ratchets 243 each (`compatibility/error-known-failures.md:35-63,157-210`). On client, 174 errors have no span; 19 starts point to a different line. The 145/145 fixture suite checks codes but not parsed expected message/position.

Impact: Vite overlays, editors, and svelte-check can show misleading prose, point at unrelated lines, or underline the wrong range while the headline test suite stays green.

Remediation: make fixture tests assert message/start/end, replace spanless `validation` calls with accurately targeted `validation_at`, and map parser diagnostics deliberately where wording compatibility is required.

Acceptance: all error message/start/end ratchets reach zero and compiler-error fixtures assert every observable diagnostic field.
