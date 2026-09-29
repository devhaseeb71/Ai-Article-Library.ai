'use strict';

// Articles 9-16.

module.exports = [
  {
    number: 9,
    slug: 'fine-tuning-llms',
    category: 'AI Engineering',
    title: 'Fine-Tuning an LLM: When It Is Worth the Trouble',
    summary:
      'Full fine-tuning, LoRA, adapters and RLHF compared, with honest guidance on cost versus benefit.',
    content: [
      '## What fine-tuning changes',
      'Fine-tuning continues training on your own data so the model shifts its behaviour, style and formatting. It is most valuable for tone, structure, classification and repeated task formats. It is the wrong tool for injecting fresh facts, where retrieval is cheaper and stays current.',
      '## The main options',
      '- **Full fine-tuning** - update every parameter. Maximum flexibility, maximum cost, and the highest risk of forgetting.',
      '- **LoRA / QLoRA** - train small low-rank adapter matrices while the base weights stay frozen. A fraction of the memory, often within a few percent of full quality.',
      '- **Adapter layers** - small trainable modules inserted into the network. Simple to swap per task.',
      '- **RLHF / DPO** - optimise for human preferences rather than raw next-token likelihood, usually on top of an already fine-tuned model.',
      '## Deciding',
      '1. Try prompting with good examples first. It is free and often sufficient.',
      '2. If you need a fixed output shape, use structured output or a schema instead of training.',
      '3. If tone and domain vocabulary are the gap, LoRA is the sweet spot.',
      '4. Only consider full fine-tuning for a genuinely different task with lots of data.',
      '## Data quality dominates',
      'A thousand excellent examples usually beat a hundred thousand noisy ones. Label your data carefully, hold out a test set that never touches training, and watch for the model learning your annotation mistakes rather than the task.',
      '## Traps',
      '- Fine-tuning on knowledge the model already has produces bloat, not accuracy.',
      '- Changing the system prompt afterwards can undo formatting you trained in.',
      '- Forgetting you can no longer easily update the behaviour without retraining.'
    ].join('\n\n')
  },
  {
    number: 10,
    slug: 'embeddings-and-vector-search',
    category: 'AI Engineering',
    title: 'Embeddings and Vector Search, from Scratch',
    summary:
      'How text becomes numbers, what cosine similarity really measures, and when keywords still beat vectors.',
    content: [
      '## The idea',
      'An embedding model converts text into a fixed-length vector of numbers such that texts with similar meanings land near each other in space. \"Kitten\" and \"young cat\" are close; \"kitten\" and \"invoice\" are far apart.',
      '## Similarity',
      'Cosine similarity measures the angle between two vectors, ignoring length. A value near 1 means similar direction, near 0 means unrelated, negative means roughly opposite. In practice, scores above roughly 0.7 usually indicate a real match, but calibrate on your own data.',
      '## Why cosine and not distance',
      'Text length barely changes meaning but strongly changes vector magnitude, so measuring direction removes the noise that raw Euclidean distance would amplify.',
      '## The index matters more than the model',
      'Exact search compares your query to every vector, which is fine up to about a hundred thousand. Beyond that you need an approximate index such as HNSW, which trades a little recall for a large speed gain. For most products, tuning the index parameters beats swapping embedding models.',
      '## Chunking strategy',
      '- Split on headings and paragraphs, not fixed character counts.',
      '- Overlap neighbouring chunks by 10 to 20 percent so facts on boundaries are not split.',
      '- Attach metadata such as section title, page and date, and filter on it.',
      '## Vectors are not always the answer',
      'If users search for error codes, product SKUs or names, keyword search wins. Hybrid search, running both a BM25 keyword index and a vector index and merging the ranked lists, is the robust default and is what most serious retrieval systems ship.'
    ].join('\n\n')
  },
  {
    number: 11,
    slug: 'ai-agents',
    category: 'Agentic AI',
    title: 'AI Agents: What Works and What Is Still Science Fiction',
    summary:
      'Tool use, planning and memory in practice, plus why autonomous agents fail and how to constrain them.',
    content: [
      '## An agent, precisely',
      'An LLM agent is a model in a loop: observe the situation, decide the next action, run the action, observe the result, repeat until it decides it is finished. The model gains three capabilities that a plain chatbot does not have: **tools**, **memory** and **a stopping condition**.',
      '## Common tools',
      '- Search and fetch web pages',
      '- Read and write files',
      '- Query a database',
      '- Call other services over HTTP',
      '- Run code in a sandbox',
      '## What genuinely works today',
      'Narrow, verifiable, multi-step tasks where each step has an obvious success signal: fixing a failing test, migrating a schema, triaging an issue queue, extracting structured data from documents. The loop is reliable when correctness can be checked cheaply.',
      '## What does not',
      '- Open-ended goals with no definition of done',
      '- Long chains where one early mistake corrupts everything downstream',
      '- Tasks needing facts the model cannot verify',
      '## Why autonomous agents stall',
      'Error compounding is the core issue. If each step is 95 percent reliable, twenty steps leaves only about 36 percent chance of full success. Long autonomous runs need verification, retries and checkpoints, which is exactly the machinery that makes them less autonomous.',
      '## Design patterns that work',
      '1. **Constrain the action space.** Fewer, well-typed tools beat many vague ones.',
      '2. **Plan once, execute many.** Free-form replanning every step causes thrashing.',
      '3. **Verify every step.** Cheap automated checks catch errors early.',
      '4. **Budget explicitly.** Cap iterations, tokens and wall-clock time.',
      '5. **Human checkpoints before anything irreversible.** Sending email, deleting data, spending money.',
      '6. **Log everything.** You cannot debug an agent you cannot read.'
    ].join('\n\n')
  },
  {
    number: 12,
    slug: 'ai-in-production',
    category: 'AI Engineering',
    title: 'Shipping AI to Production: Reliability Checklist',
    summary:
      'The gap between a working notebook and a reliable product, and the engineering that closes it.',
    content: [
      '## Models are unreliable dependencies',
      'Ordinary code either returns the right value or throws. A model returns something plausible regardless. That means you need defences a normal service does not: output validation, fallbacks, and monitoring on quality rather than just uptime.',
      '## The minimum viable production stack',
      '- **A fixed interface.** Typed requests and responses, ideally a schema the output must satisfy.',
      '- **Retries with backoff** for rate limits and transient failures.',
      '- **A fallback path.** A smaller model, a cached answer, or a human.',
      '- **Timeouts and budgets** so one slow request cannot exhaust the pool.',
      '- **Evaluation in CI.** A fixed set of test prompts runs on every prompt, model or code change.',
      '## Observability is not optional',
      'Log the full request and response, the model version, token counts, latency, and the eventual user feedback. Without this you cannot debug, audit cost, or prove a change helped. Aggregate metrics matter too: refusal rate, format-validity rate, retrieval hit rate, cost per successful task.',
      '## Version everything',
      'Models, prompts and retrieval indexes all change behaviour independently. Record the exact combination that produced each output so a bad answer from last month can still be explained.',
      '## Cost control',
      'Cache aggressively, prefer smaller models, cap context length, batch offline work, and route easy requests to cheap models. Track cost per feature, not per request, so the expensive tail is visible.',
      '## Privacy and safety',
      'Treat prompts as untrusted input, redact personal data before it leaves your boundary, filter both directions, keep an audit trail, and give users a way to see and delete their data. Never let model output reach a SQL query, a shell command, or a payment API without validation.'
    ].join('\n\n')
  },
  {
    number: 13,
    slug: 'measuring-ai-quality',
    category: 'Evaluation',
    title: 'Evaluating AI Systems Without Fooling Yourself',
    summary:
      'Offline metrics, human evaluation and online signals, plus the benchmark habits that produce false confidence.',
    content: [
      '## Start with a task, not a model',
      'Evaluation is only meaningful against a specific task and a definition of success. "Is it good?" cannot be measured. "Does it extract the invoice number, date and total with at least 98 percent field accuracy?" can.',
      '## Build a golden set',
      'Collect a few hundred real examples, label the correct answer by hand, and freeze them. Small, honest and current beats large and stale. Keep a slice you never tune against, so you can still detect overfitting.',
      '## Metrics worth using',
      '- **Exact match and F1** for extraction and classification',
      '- **Accuracy** for closed multiple choice',
      '- **Task-specific checks** such as "does the code compile and pass tests"',
      '- **Groundedness** for RAG: are claims supported by the retrieved text?',
      '- **Judge model scores** as a fast proxy, always calibrated against human labels',
      '- **Human review** on a sample for anything that matters',
      '## LLM judges, used carefully',
      'A strong model grading outputs correlates well with humans, but it inherits biases: it prefers longer answers, prefers the first option, and rewards confident tone over correctness. Counter with pairwise comparison instead of absolute scores, randomise order, hide which system produced which output, and periodically check the judge against real humans.',
      '## Online signals beat offline scores',
      'Clicks, accepted suggestions, task completion, correction rates, retention and support tickets reflect real value. Offline benchmarks drift out of date within months; online metrics stay honest.',
      '## Traps to avoid',
      'Testing on data you tuned on, cherry-picking demos, comparing different versions of the model without saying so, and reporting averages that hide a bad tail. Always report the worst case and the slice you are worst at.'
    ].join('\n\n')
  },
  {
    number: 14,
    slug: 'ai-ethics-and-bias',
    category: 'AI Ethics',
    title: 'Bias, Fairness and Accountability in AI Systems',
    summary:
      'Where bias enters a model, which fairness definitions conflict, and what an engineering team can actually do.',
    content: [
      '## Where bias comes from',
      '- **Data** - historical patterns, including past discrimination, are copied forward.',
      '- **Labels** - annotator disagreement and biased guidelines become ground truth.',
      '- **Proxy variables** - removing a protected attribute often leaves a strong correlate, such as postcode for ethnicity.',
      '- **Optimisation** - maximising average accuracy can be best for the majority and worst for the minority.',
      '## Fairness definitions conflict',
      'You cannot generally have demographic parity and equalised odds at the same time unless groups have identical base rates. This is not a bug to be fixed with effort; it is a mathematical consequence of incompatible definitions. The honest response is to choose a definition deliberately, document the trade-off, and involve the people affected.',
      '## What engineers can do',
      '1. **Measure per group, always.** Aggregate accuracy hides everything that matters.',
      '2. **Test intersectionally.** Group combinations, not just single attributes.',
      '3. **Audit the data** for representation gaps and label quality.',
      '4. **Set thresholds per group** when the law and context permit it, and document why.',
      '5. **Provide appeal.** A person affected by a decision should be able to contest it.',
      '6. **Keep humans accountable.** Blaming the model is not a governance strategy.',
      '## Practical governance',
      'Write down the intended use, known failure modes and who is harmed by them. Monitor for drift after launch. Maintain a way to report problems and a plan to pause the system. Keep records of data, model versions and decisions, because a system nobody can audit is a system nobody can defend.'
    ].join('\n\n')
  },
  {
    number: 15,
    slug: 'ai-and-jobs',
    category: 'AI Ethics',
    title: 'AI and Jobs: Tasks Before Titles',
    summary:
      'Why the right unit of analysis is the task rather than the job title, and what that means for workers and managers.',
    content: [
      '## The wrong question',
      '"Will AI replace my job?" treats a job as a single indivisible thing. A job is a bundle of tasks, and AI usually automates some of them while making others more valuable. Analysts who only look at whole occupations get the magnitude and direction wrong.',
      '## What gets exposed',
      'Tasks that are repetitive, text-based, rule-following and easy to verify: first drafts, summarising, routine customer replies, basic data cleanup, boilerplate code. These are unusually exposed because output quality is cheap to check.',
      '## What gets reinforced',
      'Tasks needing physical presence, legal or financial accountability, relationship trust, taste, judgement under ambiguity, and responsibility for outcomes. A model can advise on all of these, but a human still signs.',
      '## The augmentation case',
      'In practice the strongest results come from pairing, not replacement. Support agents with drafting assistance handle more tickets with better tone. Analysts with summarisation spend their day on decisions rather than on reading. The productivity gain lands in the workflow, not in headcount, unless management chooses otherwise.',
      '## The transition problem',
      'Displacement is real even when totals are not. The costs are concentrated on specific people at specific times, and they are recovered slowly and unevenly. Policies that matter: portable benefits, funded retraining with time off to use it, credential transparency so skills are visible, and clear rules about how automated systems may be used at work.',
      '## For managers',
      'Redesign the process first. Decide which steps a model should do, which a human must own, and where a human must review. Then be explicit with the team about what changes. People accept automation far better when they helped choose it and know what happens next.'
    ].join('\n\n')
  },
  {
    number: 16,
    slug: 'ai-security',
    category: 'Security',
    title: 'Security for AI Applications: Prompt Injection and Data Leakage',
    summary:
      'The main attack classes against AI systems, why they are hard to fully solve, and the mitigations that genuinely help.',
    content: [
      '## Prompt injection',
      'Instructing a model to ignore its system prompt and follow instructions found in user content or a retrieved document. Because both the instructions and the untrusted data occupy the same text stream, the model has no reliable way to tell them apart. Treat any text the model reads as potentially hostile.',
      '## Data exfiltration',
      'An attacker gets sensitive data out one token at a time through the model output, or reads it back through tool results. Defences include filtering output, removing secrets from the context entirely, and never placing credentials where a model can reach them.',
      '## Insecure output handling',
      'The model returns text that your application treats as trusted: it goes into a shell command, a SQL string, an HTML page or an API call. This is ordinary injection with a new source. Never pass model output to an interpreter without validation and escaping.',
      '## Over-permissioned tools',
      'Every tool the model can call is a capability an attacker will try to borrow. Follow least privilege, scope credentials per tool, require human approval for irreversible actions, and validate every argument server side regardless of what the model claims.',
      '## Model and supply chain risk',
      'Pin exact model versions. Review what data is used for provider training. Be aware that hosted models change silently, and that malicious or backdoored models exist in public repositories. Verify hashes for any model you download.',
      '## What actually helps',
      '1. Assume injection will succeed. Do not rely on filters to keep you safe.',
      '2. Put a deterministic policy layer between the model and any side effect.',
      '3. Give the model the least authority needed and no secrets it does not need.',
      '4. Require human confirmation for destructive or financial actions.',
      '5. Log prompts, outputs and tool calls, and alert on unusual patterns.',
      '6. Sandbox any code execution with no network and a read-only filesystem.',
      'Complete prevention is not currently possible. Designing so that a successful injection causes no harm is the achievable goal.'
    ].join('\n\n')
  }
];
