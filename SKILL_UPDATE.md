# Updating Smelter skill.

## Prerequisities

- Copy the current version of the `smelter-ts-docs` skill into the root of the website repo. It can be found [here](https://github.com/smelter-labs/skills).

## New skill generation

- Open your AI agent (repo is adjusted to Claude Code) and load the `update-smelter-ts-docs` (`/update-smelter-ts-docs` for Claude Code).
  - For Claude Code:
    - Use `Opus` model
    - DO NOT use plan mode, it uses more tokens and slows the work down.
- Answer all questions asked by the LLM. Most common are:
  - Location of the `smelter-ts-docs`. Sometimes it is able to find it in a project root by itself, sometimes you have to provide it.
  - TypeScript SDK version of the updated skill
- The model will then present you with the plan of the changes and ask if everything is ok. Proceed or prompt for changes. After that agent will copy
  the skill into the `smelter-ts-docs-next` directory and modify it.
- I suggest to approve changes manually as they come, as it is easier to catch hallucinations this way.

## Skill update

- Create new branch in the [smelter-labs/skills](https://github.com/smelter-labs/skills), use the `next` branch as base.
- Delete the old `smelter-ts-docs` and copy `smelter-ts-docs-next` into the `skills` repo root.
- Rename `smelter-ts-docs-next` to `smelter-ts-docs`
