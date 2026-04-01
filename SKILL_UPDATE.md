# Updating Smelter skill.

## Prerequisities

- Copy the current version of the skill that will be updated into the root of the website repo. It can be found [here](https://github.com/smelter-labs/skills).

## New skill generation

- Open your AI agent (repo is adjusted to Claude Code) and load the skills in the order they are listed:
    - `skill-creator` from Anthropic (make sure to have the newest version, if using Claude Code plugin installation is the best way to acquire it).
    - `update-<SKILL>` - it is stored in the repo in the `.claude`. If using other agent move it to proper directory.
  - For Claude Code:
    - Use `Opus` model
    - DO NOT use plan mode, it uses more tokens and slows the work down.
- Answer all questions asked by the LLM. Most common are:
  - Location of the `<SKILL>`. Sometimes it is able to find it in a project root by itself, sometimes you have to provide it.
  - TypeScript SDK version of the updated skill
- The model will then present you with the plan of the changes and ask if everything is ok. Proceed or prompt for changes. After that agent will copy
  the skill into the `<SKILL>-next` directory and modify it.
- I suggest to approve changes manually as they come, as it is easier to catch hallucinations this way.

### Issues

- Claude sometimes hangs during update. If that happens interrupt it with `ESC` and tell it to continue
- The whole procedure is pretty expensive, ($2 - $5, even up to $10 with evaluation).

## Skill update

- Create new branch in the [smelter-labs/skills](https://github.com/smelter-labs/skills), use the `next` branch as base.
- Delete the old skill and copy `<SKILL>-next` into the `smelter-skills/skills`.
- Rename `<SKILL>-next` to `<SKILL>`
- Perform the evaluation inside the [smelter-labs/skills](https://github.com/smelter-labs/skills).
