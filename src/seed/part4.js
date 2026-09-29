'use strict';

// Articles 25-32.

module.exports = [
  {
    number: 25,
    slug: 'future-of-ai-agents',
    category: 'Agentic AI',
    title: 'The Near Future of AI Agents: Three Scenarios',
    summary:
      'Copilot, autopilot and agent-to-agent commerce, and what each implies for how software gets built.',
    content: [
      '## Scenario one: the copilot dominates',
      'AI stays embedded in existing tools and the user remains in the loop for every consequential action. The interface is a text box, a sidebar, or an autocomplete. This is already the dominant model, and it is the safest for businesses because accountability stays human and errors are cheap to catch.',
      '## Scenario two: trustworthy autopilot',
      'Models handle whole multi-step processes reliably, with checks, retries and escalation, so the human approves outcomes rather than actions. Unlikely to arrive as a single breakthrough. It arrives capability by capability, as each step becomes verifiable, and the shift is visible in the monitoring and rollback tooling rather than in a product launch.',
      '## Scenario three: agents as actors',
      'Agents negotiate with each other on behalf of users: one agent books the flight, another files the expense claim, another renegotiates the contract. This needs identity, authentication, permissions, payment rails and dispute resolution, and almost all of that is unsolved. It is a protocol problem far more than a model problem.',
      '## The parts that must be built first',
      '- **Identity** - an agent that acts for a user needs verifiable delegation, not just an API key.',
      '- **Permissions and scope** - narrow, revocable, auditable authority per agent.',
      '- **Payment and escrow** - holding funds until both sides are satisfied.',
      '- **Dispute resolution** - a defined path when a deal goes wrong.',
      '- **Audit trails** - a verifiable record of what was agreed and executed.',
      '## Implication for builders',
      'The durable opportunity is the boring layer: authorisation, sandboxing, cost control, evaluation and audit. Whoever provides trustworthy delegation between software agents holds the valuable position. Plan for that, and build toward capabilities that are verifiable today rather than demos that are impressive but unverifiable.'
    ].join('\n\n')
  },
  {
    number: 26,
    slug: 'computer-use-agents',
    category: 'Agentic AI',
    title: 'Agents That Use Computers: Promise, Limits and Perils',
    summary:
      'How models operating mice and keyboards work today, and why they are brittle in ways text agents are not.',
    content: [
      '## How it works',
      'A computer-use agent takes a screenshot, decides a next action such as moving the mouse, typing or clicking, and repeats. The model reasons over a compressed screen representation rather than raw pixels, which is cheaper and faster but loses fine detail, so small text and precise targets remain difficult.',
      '## Why it is brittle',
      'Every interface detail becomes a potential failure. A moved button, a changed colour, an unexpected dialog or a slow page produces a completely different screenshot and a wrong action. The state space is enormous and errors are silent: the agent clicks something harmless, nothing happens, and it proceeds confidently toward the wrong outcome.',
      '## The loop that helps most',
      'Verification. After each action, confirm the expected change actually occurred before continuing. Screenshot comparison, DOM assertions, or asking the application itself whether the intended effect happened. An agent that checks its own effects fails gracefully; one that does not drifts.',
      '## Guardrails that matter',
      '1. **Confirm before irreversible actions** - payments, deletions, sending, publishing.',
      '2. **Restrict the environment** - a dedicated VM or container, not your own machine.',
      '3. **No standing credentials** - short-lived scoped tokens only.',
      '4. **Block list** - deny navigation to sensitive domains and admin panels.',
      '5. **Budgets** - cap steps, time and spend, and stop cleanly.',
      '6. **Full logging** - every screenshot and action, retained for review.',
      '## Where it is genuinely useful today',
      'Repetitive multi-application work with a stable layout: migrating records between systems, running a known data-entry process, testing a flow, collecting publicly available data on a schedule. Short, well-defined, verifiable tasks. Not open-ended exploration of an unfamiliar interface.'
    ].join('\n\n')
  },
  {
    number: 27,
    slug: 'ai-code-generation',
    category: 'Software Engineering',
    title: 'AI Code Generation: What Actually Helps Developers',
    summary:
      'Where AI coding tools earn their keep, why review volume rose, and the habits of teams that benefit.',
    content: [
      '## Where the value is',
      'Boilerplate, tests for existing code, refactors across many files, unfamiliar APIs, regex, SQL, documentation, and converting between formats. The pattern is consistent: the model is fastest where the work is well specified and verifiable.',
      '## Why review got harder',
      'Generated code arrives faster than humans can read it carefully, so review becomes the bottleneck. Volume rises and defects can rise with it, particularly subtle ones, because generated code often looks correct and follows conventions it inferred from the surrounding files. The measurement that matters is defects per change, not lines written.',
      '## What to insist on',
      '- **Tests must fail first.** Generate the test, watch it fail, then the fix.',
      '- **Ask for an explanation you did not request.** It reveals whether the model understood the code or is pattern matching.',
      '- **Read every dependency it wants to add.** Supply chain risk enters here.',
      '- **Keep small diffs.** A 900-line commit gets reviewed far worse than nine 100-line ones.',
      '- **No secrets in prompts.** Proprietary code and credentials do not belong in a third-party tool.',
      '## Habits of teams that benefit',
      'They pair with the tool deliberately rather than accept suggestions passively. They use it in the editor for small local changes and for tests, and they keep architecture decisions human. They measure delivery lead time and defect rate together, since a change that only makes the first number look good is not a win.',
      '## The honest summary',
      'The gain is real and large for well-specified, verifiable work: maybe a meaningful speed-up on typing-heavy tasks, close to none on the judgement calls that make software good. The bottleneck moves from writing to reading and reviewing, so practices that scale reading, such as small diffs and strong tests, become more important rather than less.'
    ].join('\n\n')
  },
  {
    number: 28,
    slug: 'ai-in-healthcare',
    category: 'Industry',
    title: 'AI in Healthcare: Where It Works and What Is Overhyped',
    summary:
      'Imaging, documentation and triage have real value. Diagnosis without a clinician remains a hard problem.',
    content: [
      '## Genuine value today',
      '- **Imaging triage** - flagging suspected strokes or pneumothorax for immediate review, with the clinician still making the call.',
      '- **Documentation** - ambient note generation, which doctors consistently rate as a major time saving.',
      '- **Administrative work** - coding, prior authorisation, discharge summaries, matching records.',
      '- **Drug discovery** - structure prediction and candidate screening, cutting the search space before wet-lab work.',
      '- **Pathology and radiology support** - second-reader software that reduces missed findings.',
      '## What is overhyped',
      'Fully autonomous diagnosis from an image, replacing radiologists, and a general purpose clinical chatbot giving reliable advice to patients. A model that is 95 percent accurate per finding is far weaker in practice than it sounds: with ten findings per study and multiple studies, the chance of at least one error is high, and a confident wrong answer is more dangerous than an abstention.',
      '## The specific challenges',
      '**Distribution shift** - a scanner model degrades at a hospital with different equipment and population. **Label quality** - ground truth often comes from a single clinician report. **Liability and regulation** - approval processes are strict and slow. **Workflow fit** - a model that adds a second screen nobody asked for increases work rather than removing it. **Privacy** - health data is among the most sensitive.',
      '## Principles for a responsible deployment',
      '1. Define the exact task and the exact population.',
      '2. Validate at the site where it will run, not just in a paper.',
      '3. Present output as decision support with a clear abstain option.',
      '4. Monitor performance continuously for drift, not just at launch.',
      '5. Log every prediction for review and audit.',
      '6. Report outcomes in a published trial, not a demo.'
    ].join('\n\n')
  },
  {
    number: 29,
    slug: 'ai-in-education',
    category: 'Industry',
    title: 'AI in Education: Tutoring, Feedback and Assessment',
    summary:
      'Personalised practice looks promising, academic integrity is unresolved, and assessment design must change.',
    content: [
      '## The strongest case: practice',
      'AI tutoring gives unlimited, patient, individually paced practice with immediate feedback, at a cost per learner that approaches zero. That is a real advantage for the part of learning that is repetition, which is most of it. Studies on practice with feedback show large gains, and AI removes the bottleneck of teacher time.',
      '## The weak case: judgement',
      'Feedback on a first draft is less clearly improved. A model writes a plausible compliment about vague work, which feels like feedback and is not. Genuine critique requires knowing the discipline deeply and the student\'s history, which is where a model is weakest.',
      '## Academic integrity',
      'The unbundled essay is effectively a solved problem and a lost assessment. The answer is not detection, which is unreliable because detectors produce false positives that punish honest students, but redesign: oral defences, in-class work under supervision, drafts and version history, project-based assessment, and a culture where using AI is declared rather than punished. Make the rules explicit, because a vague policy pushes everyone toward concealment.',
      '## Personalisation, with a caveat',
      'Adaptive pacing genuinely helps, but the system optimises for what the student already does well and skips the material they find hardest, since that is where engagement drops. Any good system therefore needs an explicit difficulty floor and a human who reviews the map.',
      '## What to do as an institution',
      '1. Publish a clear, specific usage policy with examples.',
      '2. Redesign assessment around process and defence, not just product.',
      '3. Pilot tutoring tools with teachers who choose them, not imposed on them.',
      '4. Train staff on verification rather than detection.',
      '5. Measure learning gains against a control, not satisfaction surveys.'
    ].join('\n\n')
  },
  {
    number: 30,
    slug: 'model-context-protocol',
    category: 'AI Engineering',
    title: 'Model Context Protocol and Tool Integration Patterns',
    summary:
      'A shared convention for exposing tools and data to models, and the design rules that keep tool use reliable.',
    content: [
      '## The problem with ad-hoc tool calls',
      'Every model has its own JSON conventions, error formats and streaming quirks, so every integration is bespoke. Prompts drift, tool descriptions drift, and behaviour changes when a model version changes. A shared protocol standardises the transport so the interesting work moves to capability design.',
      '## What a protocol provides',
      'A standard way to describe tools, their inputs and their outputs, a standard request and response envelope, and a server that can host several capabilities. Because the interface is fixed, the same tool server works with different models, and a capability can be written once and reused.',
      '## Tool design rules that matter',
      '1. **One clear purpose per tool.** Tools that bundle unrelated actions get called wrongly.',
      '2. **Expressive names and descriptions.** The description is documentation the model actually reads; include the units, the format and the failure modes.',
      '3. **Validate arguments server side.** Never trust the model\'s types.',
      '4. **Return errors as data.** An explanatory error lets the model retry; a crash or a stack trace does not.',
      '5. **Keep responses small.** Return summaries with links, not entire documents.',
      '6. **Make operations idempotent** where possible, so a retry is harmless.',
      '7. **Paginate and filter** rather than returning everything at once.',
      '## Reliability patterns',
      'Confirm destructive operations. Validate and sanitise every output. Cap the number of tool calls per request. Log every call with arguments and results so failures are diagnosable. Add a dry-run mode for anything irreversible. Cache deterministic lookups.',
      '## Design lesson',
      'Most tool failures are description failures, not capability failures. When a model misuses a tool, rewrite the description before you add parameters, and test with realistic messy inputs rather than tidy examples.'
    ].join('\n\n')
  },
  {
    number: 31,
    slug: 'local-first-ai',
    category: 'AI Engineering',
    title: 'Running AI Locally: Models, Tools and Realistic Expectations',
    summary:
      'What you can genuinely run on consumer hardware today, and how to evaluate quality versus speed yourself.',
    content: [
      '## What is possible now',
      'On a modern laptop CPU, small models in the 1 to 4 billion parameter range run at a usable pace for short prompts, especially with quantisation. With 16 GB of system RAM, models around 7 to 8 billion parameters at 4-bit are comfortable. With a consumer GPU holding 8 GB or more, larger models and higher context become practical. Code assistants in the 1 to 3 billion range run on hardware from the last five years.',
      '## The toolchain',
      'Pick a runtime, then a quantisation, then a model. Quantisation is the lever that matters most: 4-bit roughly quarters memory compared with 16-bit and costs only a little quality. GPU offload is the second lever, and layer count is a coarse but effective control for the speed and memory trade-off.',
      '## How to evaluate honestly',
      'Run your own prompts, on your own hardware, with the quantisation you would actually ship. Published benchmarks say little about your use case, and synthetic speeds are measured on prompts far longer and more structured than a typical chat. Measure time to first token and total generation time separately, since responsiveness usually depends on the first.',
      '## When local is the right choice',
      'Privacy requirements, offline work, unpredictable or metered API costs, a need for low-latency small edits, fine-tuning on your own data, and a preference for a model that does not change under you. When hosted is right: frontier quality matters, traffic is low and bursty, and you would rather not operate GPUs.',
      '## A sensible hybrid',
      'Run a local model for the high-volume simple work, summarise, classify, autocomplete and drafting, and escalate the genuinely hard cases to a hosted model. Send only what is necessary across the boundary. Most teams find this split captures most of the benefit at a fraction of the cost.'
    ].join('\n\n')
  },
  {
    number: 32,
    slug: 'learning-roadmap',
    category: 'Career',
    title: 'A Practical Learning Roadmap for AI in 2026',
    summary:
      'A sequenced study plan with real projects at each stage, and the fundamentals that are worth skipping past.',
    content: [
      '## Stage one: foundations, two to four weeks',
      'Linear algebra you will actually use: vectors, matrices, dot products, eigenvalues. Calculus: derivatives and partial derivatives. Probability: distributions, expectation, variance, Bayes. Python with NumPy. Build a linear regression by hand, then logistic regression, so you understand gradient descent rather than calling a library.',
      '## Stage two: core machine learning, four to six weeks',
      'Decision trees, random forests, gradient boosting, k-nearest neighbours, k-means, principal component analysis, regularisation, cross-validation and the bias and variance trade-off. Use a standard library for most of this. Then implement one algorithm from scratch, usually gradient descent, to feel what the machinery does.',
      '## Stage three: deep learning, four to six weeks',
      'Build a small neural network with only NumPy, including backpropagation by hand. Then move to PyTorch and train on MNIST, then CIFAR-10, then a small text model. Learn transformers properly, not approximately.',
      '## Stage four: applied, ongoing',
      'Pick one domain and build real projects: a retrieval system over your own documents, a fine-tuned small model, an evaluation harness, an agent that does a bounded task end to end. Ship something with users, even two.',
      '## Projects that teach the most',
      'A chatbot that cites sources from a PDF collection. A classifier with a proper evaluation set and a drift check. A small language model fine-tuned on a narrow domain. A tool-using agent with retries, logging and an evaluation set. Each of these forces you through data, evaluation, deployment and monitoring, which is what the work actually is.',
      '## What to skip',
      'Deriving every theorem by hand, obsolete architectures except as historical context, and endless framework tutorials. Also skip trying to learn everything, since nobody does. Depth in one area plus a working grasp of the rest beats shallow coverage of everything.',
      '## How to keep up',
      'Read papers selectively, follow a few practitioners who publish evaluations rather than opinions, and rebuild one thing per month. The field shifts fast enough that the durable skills are problem framing, evaluation, and knowing when not to use AI.'
    ].join('\n\n')
  }
];
