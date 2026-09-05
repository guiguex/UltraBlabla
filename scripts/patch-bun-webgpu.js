// scripts/patch-bun-webgpu.js — postinstall patcher for bun-webgpu.
//
// Applies two upstream PRs that are still OPEN (not merged) on
// kommander/bun-webgpu:
//   - PR #7 "Add missing bindingArraySize field"
//        https://github.com/kommander/bun-webgpu/pull/7
//   - PR #8 "Release command buffer references after submit"
//        https://github.com/kommander/bun-webgpu/pull/8
//
// Why we need them NOW:
//   - PR #7 fixes a struct layout mismatch on Linux/Mac (and any model that
//     uses binding arrays). On Windows it happens to work because of the
//     `_alignment0` workaround, but that's still a bug per WebGPU spec.
//   - PR #8 fixes a memory leak in the GPU command buffer pool. Without it,
//     VRAM grows unbounded on a long-running inference loop (bad for our
//     voice server).
//
// Idempotent: re-running on an already-patched file is a no-op.
//
// Usage: node scripts/patch-bun-webgpu.js
//        (also wired into package.json `postinstall`)

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TARGET = join(import.meta.dirname, "..", "node_modules", "bun-webgpu", "index.js");

const PATCHES = [
  {
    name: "PR #7 — add bindingArraySize field",
    needs: '["_alignment0", "u32", { default: 0, condition: () => process.platform !== "win32" }]',
    fix:  '["bindingArraySize", "u32", { default: 0 }]',
  },
  {
    name: "PR #8 — release command buffers after submit",
    needs: 'this.lib.wgpuQueueSubmit(this.ptr, commandBuffersArray.length, ptr2(handleView.buffer));\n  }\n  onSubmittedWorkDone()',
    fix:  'this.lib.wgpuQueueSubmit(this.ptr, commandBuffersArray.length, ptr2(handleView.buffer));\n\n    for (const buffer of commandBuffersArray) {\n      buffer._destroy();\n    }\n  }\n  onSubmittedWorkDone()',
  },
];

let src = readFileSync(TARGET, "utf8");
let changed = 0;

for (const p of PATCHES) {
  if (src.includes(p.fix.slice(0, 60))) {
    console.log(`[bun-webgpu patch] ✓ ${p.name} (already applied)`);
    continue;
  }
  if (!src.includes(p.needs.slice(0, 80))) {
    console.warn(`[bun-webgpu patch] ✗ ${p.name} — source signature not found, SKIPPED`);
    console.warn(`                  maybe the upstream package has moved past this fix — check https://github.com/kommander/bun-webgpu`);
    continue;
  }
  src = src.replace(p.needs, p.fix);
  changed++;
  console.log(`[bun-webgpu patch] ✓ ${p.name}`);
}

if (changed > 0) {
  writeFileSync(TARGET, src, "utf8");
  console.log(`[bun-webgpu patch] ${changed} patch(es) applied to ${TARGET}`);
} else {
  console.log(`[bun-webgpu patch] nothing to do`);
}