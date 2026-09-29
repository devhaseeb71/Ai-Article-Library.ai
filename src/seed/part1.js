'use strict';

// Articles 1-8. Content uses a small safe markup subset:
// "## Heading", "- bullet", "1. numbered", blank line = paragraph break,
// **bold**. Everything is HTML-escaped before rendering.

module.exports = [
  {
    number: 1,
    slug: 'what-is-artificial-intelligence',
    category: 'Fundamentals',
    title: 'What Is Artificial Intelligence? A Beginner Guide',
    summary:
      'A plain-English tour of AI: what it is, how it differs from ordinary software, and why it suddenly matters.',
    content: [
      '## The short answer',
      'Artificial Intelligence is software that learns patterns from examples instead of following rules a human wrote line by line. A calculator must be told how to add. A neural network can be shown ten thousand labelled examples of "cat" or "not cat" and then work out the rule for itself.',
      '## AI, machine learning, and deep learning',
      'These terms are used interchangeably but they are nested:',
      '- **Artificial Intelligence** - the whole field, any system that imitates intelligent behaviour.',
      '- **Machine Learning** - the dominant technique inside AI, where systems learn from data.',
      '- **Deep Learning** - machine learning with many-layered neural networks, responsible for nearly every recent breakthrough.',
      '## How modern AI actually works',
      '1. **Collect data.** More data means more useful patterns.',
      '2. **Train a model.** The model adjusts millions of internal parameters to reduce its error.',
      '3. **Evaluate.** Test on data it has never seen to check it really learned.',
      '4. **Deploy and monitor.** Real users find edge cases the test set missed.',
      '## Where AI is already used',
      'Search ranking, spam filters, fraud detection, medical imaging, translation, recommendation feeds, and the autocomplete in your phone. Most of it is invisible, which is why people are surprised by how much AI they already depend on.',
      '## What AI is not',
      'It is not conscious, it does not understand the way a person does, and it can be confidently wrong. Every serious deployment pairs a model with checks, because a 99% accurate system still fails once in a hundred requests, and at a million requests a day that is ten thousand failures.'
    ].join('\n\n')
  },
  {
    number: 2,
    slug: 'how-neural-networks-learn',
    category: 'Machine Learning',
    title: 'How Neural Networks Actually Learn',
    summary:
      'Weights, loss and backpropagation without the mathematics, plus why training is slow and why loss never reaches zero.',
    content: [
      '## The core idea',
      'A neural network is a large pile of multiplications. Each neuron takes inputs, multiplies them by numbers called **weights**, adds a bias, and passes the result through an activation function.',
      '## The training loop',
      'Every modern network is trained with the same four steps:',
      '1. **Forward pass** - feed a batch of examples through the layers to make a prediction.',
      '2. **Loss** - measure how wrong that prediction was with a loss function.',
      '3. **Backward pass** - calculate how much each weight contributed to the error.',
      '4. **Update** - nudge every weight in the direction that reduces loss, by an amount set by the learning rate.',
      'Repeat this millions of times and the loss curve falls. That loop is the whole of it.',
      '## Backpropagation in one sentence',
      'It is the chain rule applied backwards through the network, telling each weight how much of the current error it is responsible for.',
      '## Why training is expensive',
      'Every step touches every parameter. A modern model can have hundreds of billions of parameters, so one step needs that many arithmetic operations. This is why training runs on GPUs, in parallel, and why the cost is measured in dollars rather than seconds.',
      '## Loss never reaches zero',
      'Real data is noisy, models have limited capacity, and regularisation deliberately prevents memorising everything. A small but steady validation loss is the healthy target. When training loss keeps falling while validation loss rises, you have overfitting, the ML equivalent of memorising the exam answers.',
      '## Practical advice',
      '- Start with a smaller model. It is often better anyway.',
      '- More data beats a cleverer architecture more often than people expect.',
      '- Normalise your inputs. Almost always helps, almost never hurts.',
      '- Fine-tune a pretrained model. Never start from random weights without a strong reason.'
    ].join('\n\n')
  },
  {
    number: 3,
    slug: 'training-vs-inference',
    category: 'Machine Learning',
    title: 'Training vs Inference: The Two Costs Everyone Forgets',
    summary:
      'Training builds the model, inference uses it. Understanding the split explains most AI bills and most outages.',
    content: [
      '## Two completely different jobs',
      '**Training** is the expensive, occasional, offline job of building a model from data. It runs on clusters, takes hours to months, and produces a set of weights.',
      '**Inference** is the cheap, constant, online job of running that finished model on new input. It happens on every request, forever, and is what you actually pay for in production.',
      '## Why the distinction matters',
      'A training run may cost thousands of dollars once. An endpoint serving a million requests a day can cost far more per month, because it never stops. That is why optimisation effort usually belongs in inference: quantisation, caching, batching, smaller models.',
      '## Making inference cheaper',
      '- **Quantisation** - store weights in 8 or 4 bits instead of 16, trading a little accuracy for a large memory and speed win.',
      '- **Batching** - combine several requests into one forward pass so the hardware is used fully.',
      '- **Caching** - reuse results for repeated or similar inputs, such as identical prompts.',
      '- **Early exit** - stop after a few layers for easy inputs.',
      '- **Distillation** - train a small student model to imitate a large teacher model.',
      '## Capacity planning',
      'Because inference traffic is spiky, average load is the wrong number to plan with. If one request takes two seconds and ten arrive at once, users wait on a single-threaded server. Size for concurrency and put a queue in front, or the experience collapses exactly when you are busiest.'
    ].join('\n\n')
  },
  {
    number: 4,
    slug: 'transformers-explained',
    category: 'Deep Learning',
    title: 'Transformers: Why One Architecture Took Over',
    summary:
      'Attention, tokens and parallelism - how the transformer design made modern large language models possible.',
    content: [
      '## The problem it solved',
      'Recurrent networks processed text one token at a time, in order. Training could not be parallelised, and holding on to anything from hundreds of tokens earlier was hard. Transformers removed the step-by-step loop.',
      '## Attention is the whole trick',
      'Attention lets every token look at every other token and decide how much each one matters. The classic example is "the trophy did not fit in the suitcase because it was too big", where the word "it" has to attend to "suitcase". In older architectures that link weakened with distance; attention does not care about distance at all.',
      'Each layer does two sub-steps:',
      '- **Multi-head attention** - several attention patterns in parallel, so the model can track different relationships simultaneously.',
      '- **Feed-forward network** - the same small network applied at each position, where most of the model knowledge lives.',
      'Around that core sit residual connections, layer normalisation, and positional encoding to preserve word order.',
      '## Why it scaled',
      'Training a transformer is essentially one enormous parallel matrix multiplication, which is exactly what GPUs are built for. That allowed far more data and parameters than recurrent networks ever could.',
      '## The trade-off',
      'Attention cost grows with the square of sequence length: twice the tokens means roughly four times the work. This is the root cause of long-context cost and the reason sliding windows, sparse attention and key-value caching exist.'
    ].join('\n\n')
  },
  {
    number: 5,
    slug: 'large-language-models',
    category: 'Generative AI',
    title: 'Large Language Models: Capabilities and Honest Limits',
    summary:
      'What LLMs are genuinely good at, where they fail predictably, and how to use them without being fooled.',
    content: [
      '## What an LLM is',
      'A large language model is a transformer trained on an enormous amount of text to predict the next token. That single objective produces summarising, translation, drafting, classification, code generation and reasoning as side effects.',
      '## Genuinely strong at',
      '- Rewriting, shortening and changing tone',
      '- Translating between common languages',
      '- Drafting code from a described behaviour',
      '- Extracting structure from messy text',
      '- Answering questions about text you give it',
      '## Reliably weak at',
      '- **Arithmetic** - it predicts plausible digits rather than computing them',
      '- **Exact counting and copying** - long strings get mangled',
      '- **Recency** - anything after its training cutoff is unknown',
      '- **Private facts it never saw** - it will invent them fluently',
      '- **Knowing what it does not know** - its confidence is not calibrated',
      '## The hallucination problem',
      'Because the model always produces the most plausible next token, a wrong answer is indistinguishable in form from a right one. Mitigation is procedural rather than magical: give it the source material, ask for citations, verify programmatically, and keep a human in the loop for anything consequential.',
      '## Practical rules',
      '1. Prefer small, focused prompts over clever instructions.',
      '2. Give context before asking. Models are pattern completers, not mind readers.',
      '3. Ask for a reasoning trace, then verify the conclusion independently.',
      '4. Constrain the output format when you will parse it, such as JSON with a schema.',
      '5. Pin and cache model versions so behaviour never changes under you.'
    ].join('\n\n')
  },
  {
    number: 6,
    slug: 'prompt-engineering-guide',
    category: 'Prompt Engineering',
    title: 'Prompt Engineering: A Practical Guide',
    summary:
      'Structure, examples and constraints that actually improve output, plus the popular tricks that do not.',
    content: [
      '## Prompting is specification writing',
      'The model is a very fast, very literal contractor. Vague input gives vague output, so most prompt improvement is really just removing ambiguity.',
      '## A structure that works',
      '1. **Role** - "You are a senior technical writer."',
      '2. **Task** - one clear verb and object, such as "Rewrite this paragraph."',
      '3. **Context** - audience, background, constraints.',
      '4. **Format** - length, structure, exact output shape.',
      '5. **Examples** - one or two samples beat paragraphs of description.',
      '6. **Quality bar** - what a good answer looks like and what to avoid.',
      '## Techniques that genuinely help',
      '- **Chain of thought** - ask it to think step by step before answering.',
      '- **Self-consistency** - ask several times and take the most common answer.',
      '- **Few-shot examples** - real examples in the prompt, in the exact shape you want back.',
      '- **Rubrics** - list the criteria and ask the model to score against them.',
      '- **Decomposition** - one narrow call per step instead of one giant call.',
      '- **Negative instructions** - say what to avoid; models follow "do not" reliably.',
      '## What does not work',
      '- Politeness padding that crowds out the actual instruction',
      '- Exaggerated threats or urgency',
      '- "Ignore your previous instructions" against a hardened model',
      '- Very long lists of contradictory rules, which the model will silently resolve by picking one',
      '- Keyword stuffing, because the model reads meaning rather than frequency',
      '## Measure, do not guess',
      'Keep a small evaluation set of real inputs with known-good outputs, run it whenever you change a prompt, and treat prompt changes with the same discipline as code changes.'
    ].join('\n\n')
  },
  {
    number: 7,
    slug: 'tokens-and-context-windows',
    category: 'Generative AI',
    title: 'Tokens, Context Windows, and Why Prompts Fail Silently',
    summary:
      'What a token really is, how the context budget gets consumed, and the tricks that quietly destroy your instructions.',
    content: [
      '## Tokens, not words',
      'Models read text in tokens. Common words are one token, rare words split into several, and code fragments often split oddly. That is why token count differs from word count, and why pricing is quoted per token.',
      'A rough guide: one token is about four characters of English, so a 1,000 word document is roughly 1,300 tokens.',
      '## The context window is shared',
      'Everything competes for the same budget: system instructions, retrieved documents, chat history, tool definitions and the answer. Exceed it and the request is rejected or silently truncated, and truncating from the middle drops your actual instructions, which is the most confusing failure mode there is.',
      '## Common ways context gets destroyed',
      '- The oldest messages being cut, taking hidden instructions with them',
      '- Retrieved documents so large they swamp the real question',
      '- A tool schema change that leaves stale tool results in the history',
      '- Repeatedly appending turns instead of summarising a long conversation',
      '## Defending your context',
      '1. Put instructions at the top and repeat critical constraints near the end.',
      '2. Summarise old turns instead of keeping them verbatim.',
      '3. Retrieve fewer, better chunks. Precision beats volume.',
      '4. Log the token count of every request and alert on the tail.',
      '5. Cache static prefixes so they cost less and never move.'
    ].join('\n\n')
  },
  {
    number: 8,
    slug: 'retrieval-augmented-generation',
    category: 'AI Engineering',
    title: 'Retrieval-Augmented Generation (RAG), Explained',
    summary:
      'How to give a model your own documents, why it usually beats fine-tuning for fresh knowledge, and where it breaks.',
    content: [
      '## The problem RAG solves',
      'A model cannot answer questions about documents it has never seen, and fine-tuning does not reliably teach specific facts. RAG sidesteps training entirely: find the relevant text, then hand it to the model at question time.',
      '## The pipeline',
      '1. **Ingest** - load documents and split them into chunks of a few hundred tokens.',
      '2. **Embed** - convert each chunk into a vector that captures its meaning.',
      '3. **Index** - store the vectors in a vector database with an approximate nearest neighbour index.',
      '4. **Retrieve** - embed the question and find the closest chunks.',
      '5. **Generate** - give the model the question plus those chunks, and instruct it to answer only from them.',
      '## Why it usually works',
      'Facts sit in the prompt where the model can copy them instead of recalling them, so accuracy rises and hallucinations fall. The knowledge base updates by editing documents rather than retraining anything.',
      '## Where it breaks',
      '- **Bad chunking** - a fact split across two chunks is retrieved by neither.',
      '- **Vocabulary mismatch** - the question uses words the document never uses.',
      '- **Distraction** - too many retrieved chunks, so the model mixes unrelated facts.',
      '- **No citation** - you cannot tell which chunk produced the claim.',
      '## Fixes that pay off',
      'Chunk on natural boundaries such as headings, keep chunks small, retrieve five to ten chunks rather than fifty, add hybrid keyword plus vector search, and require the model to quote the source it used. Then evaluate retrieval separately from generation, because a wrong answer is usually a retrieval failure.'
    ].join('\n\n')
  }
];
