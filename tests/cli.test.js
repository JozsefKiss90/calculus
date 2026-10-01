import { test } from "node:test";
import assert from "node:assert/strict";
import { runWiki } from "./helpers/vault.js";

test("running with no subcommand prints usage and exits non-zero", async () => {
  const { exitCode, stderr } = await runWiki([]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /usage/i);
  assert.match(stderr, /check/);
});

test("an unknown subcommand names the subcommand and exits non-zero", async () => {
  const { exitCode, stderr } = await runWiki(["validate", "wiki"]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /validate/);
});

test("check without a vault directory says a vault directory is required", async () => {
  const { exitCode, stderr } = await runWiki(["check"]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /vault directory/i);
});

test("--help prints usage on stdout and exits zero", async () => {
  const { exitCode, stdout } = await runWiki(["--help"]);

  assert.equal(exitCode, 0);
  assert.match(stdout, /usage/i);
  assert.match(stdout, /check <vault directory>/);
});

test("check takes one vault directory, not several", async () => {
  const { exitCode, stderr } = await runWiki(["check", "wiki", "also-wiki"]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /one vault directory/);
});

test("an option check does not have is named rather than read as a vault directory", async () => {
  const { exitCode, stderr } = await runWiki(["check", "wiki", "--terminal"]);

  assert.notEqual(exitCode, 0);
  assert.match(stderr, /takes no options, given "--terminal"/);
});
