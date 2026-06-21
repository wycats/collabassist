# Collabassist Vision

Collabassist is a collaborative AI workspace for turning uncertain ideas into structured choices, durable decisions, and inspectable artifacts.

It starts where chat assistants are strongest: a person has a fuzzy goal and wants help. But instead of letting the conversation become the whole workspace, Collabassist turns the collaboration into a visible loop:

```text
prompt -> interpret -> commit intent -> propose -> commit path -> inspect -> accept/pin artifact
```

The goal is not to replace judgment with automation. The goal is to make AI collaboration easier to steer, easier to trust, and easier to resume.

## The Problem

Most AI products still treat chat as the primary interface for thinking with a model. That works surprisingly well for short tasks, but it breaks down when the work has shape, history, alternatives, and consequences.

In chat-only tools:

- The assistant often guesses what the user meant instead of making ambiguity visible.
- The user steers by rewriting prompts instead of choosing from clear options.
- Important decisions get buried in the transcript.
- Outputs are hard to inspect as structured objects.
- Returning to a project later means rereading the conversation and reconstructing the state of the work.

At the other end of the spectrum, many agent tools focus on execution: run commands, edit files, complete tasks. That is valuable, but it is not the whole collaboration problem. A lot of high-value work happens before execution, when a person and an assistant are still shaping intent, comparing paths, naming trade-offs, and deciding what should become real.

Collabassist is built for that middle space.

## The Vision

Collabassist treats AI collaboration as a sequence of explicit moves.

The assistant does not only answer. It helps the user clarify, compare, sketch, inspect, refine, and branch. The user does not only prompt. They commit, reject, fork, and pin the parts of the work that should become durable.

The product should feel like working with a thoughtful junior partner:

- The human sets direction, constraints, taste, and priorities.
- The AI surfaces interpretations, explores alternatives, drafts structures, and notices implications.
- The interface keeps the collaboration legible by separating provisional ideas from accepted decisions.

The core bet is simple: durable AI work should leave behind more than a transcript. It should leave behind a decision trail and a set of artifacts that explain where the project is and how it got there.

## Core Concepts

### Cards

Cards are structured units of collaboration. They turn model output into something the user can act on directly.

Examples:

- **Interpret**: "Here are the plausible ways to understand your request."
- **Propose**: "Here are several paths we could take."
- **Inspect**: "Here is the structure, layout, model, or flow behind this idea."
- **Error**: "Something recoverable went wrong, and here is how to continue."

Cards make AI behavior visible. Instead of hoping that prose contains the right shape, the product gives important interaction patterns their own types, schemas, and UI.

### Decisions Rail

The Decisions Rail is the committed history of the work.

It answers questions chat transcripts answer poorly:

- What did we decide?
- Which path are we on?
- What artifact did this decision produce?
- What alternatives did we leave behind?
- Can we return to an earlier point and branch from there?

The rail is not a log of everything that happened. It is the durable spine of the collaboration.

### Artifacts

Artifacts are the stable objects produced by the collaboration: specs, mockups, schemas, plans, flows, documents, or code-oriented structures.

Cards help the user decide what should exist. Artifacts hold the thing once it becomes worth keeping.

### Branches

Good collaboration includes alternatives. Collabassist should make it natural to fork a line of thought, explore a candidate, and then either accept it or return to the previous path.

Branching matters because AI is good at producing plausible options, while humans are responsible for choosing which option fits the real context.

## How It Fits in the AI Tool Landscape

Collabassist is not trying to be the best general-purpose chatbot. General chat is flexible, but it makes the transcript do too much.

It is not only an agent executor. Execution matters, but Collabassist is especially interested in the work of forming intent before execution.

It is not only a document or canvas tool. Documents and canvases preserve outputs, but they often lose the decisions and alternatives that produced those outputs.

It is not only a workflow automation platform. Automation is useful when the process is known. Collabassist is for work where the process is being discovered with the user.

The broader opportunity is a new class of AI tools: collaborative thinking environments. These tools help people move from ambiguity to committed structure without hiding the path.

## Where Collabassist Should Win

Collabassist is strongest when the work is exploratory, structural, and worth resuming later.

Promising domains include:

- Product planning and feature design.
- Technical architecture and system modeling.
- UX flows, information architecture, and mockups.
- Research synthesis and option comparison.
- Spec writing and requirements refinement.
- Data models, policies, permissions, and operational workflows.

These are not just "generate an answer" tasks. They are judgment tasks. The value comes from making the reasoning path visible enough that the human can steer it.

## Product Principles

### Make ambiguity explicit

When a request can mean several things, the assistant should not silently choose one. It should present interpretations the user can commit to or correct.

### Keep humans in authority

The assistant can suggest, draft, inspect, and warn. The user decides what becomes part of the project.

### Separate provisional from committed

Not every model output deserves to become project state. Cards can be tentative. Accepted decisions and pinned artifacts are durable.

### Preserve the path, not just the result

The final artifact matters, but so do the decisions that shaped it. A user should be able to return after time away and understand the project without replaying the whole chat.

### Prefer structured moves over prompt archaeology

If the user has to remember the magic wording that made the AI useful, the product has failed. Common collaboration moves should become visible controls and reusable patterns.

### Stay model-agnostic

The product should not depend on one provider's quirks. Models should produce structured data through a stable contract, and the UI should decide how that structure becomes interaction.

## The First Product Loop

The first useful loop is intentionally small:

1. The user gives a prompt.
2. The assistant returns an Interpret card.
3. The user commits an intent.
4. The assistant returns a Propose card.
5. The user commits a path.
6. The assistant returns an Inspect card, such as a mockup or lens.
7. The user accepts or pins the artifact.

From there, the user can refine, fork, compare, or continue.

This loop is the smallest version of the product thesis. It proves that AI interaction can be designed as a set of structured moves instead of a stream of messages.

## What Success Looks Like

Collabassist is succeeding when a user can come back to a project after days or weeks and immediately understand:

- The current direction.
- The decisions already accepted.
- The alternatives still available.
- The artifacts worth keeping.
- The next move the collaboration is ready for.

The product should make AI feel less like a black box that emits text and more like a partner whose work can be inspected, challenged, branched, and committed.

That is the core vision: AI collaboration with memory, structure, and human authority.
