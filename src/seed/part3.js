'use strict';

// Articles 17-24.

module.exports = [
  {
    number: 17,
    slug: 'computer-vision',
    category: 'Deep Learning',
    title: 'Computer Vision: From Pixels to Useful Predictions',
    summary:
      'Convolutions, transfer learning and the vision task families you are most likely to build.',
    content: [
      '## Why vision was the first deep learning success',
      'Images produce a dense, structured signal where the labels are cheap to collect, so progress arrived years before it did for language. The decisive shift was ImageNet in 2012, when a deep convolutional network cut image classification error so far that the field changed overnight.',
      '## Convolutional networks',
      'A convolution slides a small filter across the image, detecting edges, then textures, then parts, then objects. Three properties matter: **weight sharing** means one filter works everywhere, **hierarchy** means simple features compose into complex ones, and **pooling** reduces size while keeping the strongest signals.',
      '## Transfer learning is the default',
      'Do not train from scratch. Take a network pretrained on a large dataset, replace its final classification layer, and fine-tune on your data, usually with a low learning rate and a frozen early layers. This works with a few hundred images where training from scratch needs tens of thousands.',
      '## Task families',
      '- **Classification** - one label per image',
      '- **Object detection** - boxes plus labels, using tools such as YOLO or Faster R-CNN',
      '- **Segmentation** - a label per pixel, for medical imaging and scene understanding',
      '- **Pose estimation** - keypoints, for movement analysis',
      '- **Image generation** - diffusion models, which now dominate image synthesis',
      '## Practical notes',
      'Watch for leakage between train and test. If the same subject appears in both, you are measuring memorisation. Use augmentations such as flips, colour jitter and random crops, and check that they match your real deployment conditions. Also confirm the images you train on resemble production images in lighting, resolution and camera quality.'
    ].join('\n\n')
  },
  {
    number: 18,
    slug: 'speech-recognition',
    category: 'Deep Learning',
    title: 'Speech Recognition and Text to Speech',
    summary:
      'How modern ASR and TTS systems work, and the engineering required to make them usable in a product.',
    content: [
      '## Automatic speech recognition today',
      'The standard architecture is an acoustic model plus a language model. A neural acoustic model turns audio into character or token probabilities, and a language model corrects implausible sequences. The decoder combines them by searching for the most likely transcript given the audio.',
      'The biggest recent gains came from replacing hand-built features with learned ones, from end-to-end training, from using much larger audio corpora, and from transcribing audio chunks in parallel so long recordings process quickly.',
      '## Text to speech',
      'Modern systems predict a sequence of acoustic features from text, then a neural vocoder converts those features into raw audio. Concatenative systems, which stitched together recorded snippets, produced smoother and more natural results but could not say anything outside their recordings. The neural approach is fully generative, at the cost of occasional mispronunciation.',
      '## The engineering that matters',
      '- **VAD** - voice activity detection, so you transcribe speech rather than silence.',
      '- **Diarisation** - who spoke when, which matters for meetings and call centres.',
      '- **Timestamps** - needed for subtitles and for aligning transcripts to video.',
      '- **Noise robustness** - test on real noise, not clean recordings.',
      '- **Partial results** - stream interim transcripts so the UI feels instant.',
      '## Measuring quality',
      'Word error rate is the standard metric and is easy to misread. It does not capture whether a mistake changes meaning, and a system tuned for a metric can degrade badly for a particular accent, language or audio device. Evaluate per demographic slice and with real users.'
    ].join('\n\n')
  },
  {
    number: 19,
    slug: 'reinforcement-learning',
    category: 'Machine Learning',
    title: 'Reinforcement Learning: Rewards, Policies and Exploration',
    summary:
      'The core loop, the algorithm families, and the sample efficiency problem that keeps RL out of most products.',
    content: [
      '## The loop',
      'An agent takes an action in an environment, receives a reward, and learns to maximise expected future reward. The policy maps states to actions. Value functions estimate how much reward is expected from a state onwards, and the advantage measures how much better a chosen action was than the average.',
      '## Model-free versus model-based',
      '**Model-free** methods such as Q-learning and PPO learn directly from experience and need no simulation. **Model-based** methods learn a simulation of the environment and plan inside it, which is far more sample efficient but harder to get right.',
      '## Policy gradient family',
      'REINFORCE, actor-critic and PPO all directly adjust the policy in the direction that produced better outcomes. PPO is the current default because it clips updates, which keeps training stable. They handle continuous actions well, which is why they dominate robotics.',
      '## The exploration problem',
      'The agent must try unfamiliar actions to discover rewards, but random exploration is expensive when actions have real consequences. Techniques include epsilon-greedy for simple cases, entropy bonuses to keep policies from collapsing, and curiosity and noise-based exploration for sparse reward settings.',
      '## Why RL is rare in production',
      'The sample efficiency problem. Learning from real-world trials means trying bad actions on real users. That makes RL appropriate for games, robotics simulation, and recommendation where exploration is cheap, and generally inappropriate where a mistake is visible and costly. Offline RL, learning purely from logged data, removes the exploration risk at the cost of being stuck with the behaviour of the logging policy.'
    ].join('\n\n')
  },
  {
    number: 20,
    slug: 'machine-learning-ops',
    category: 'AI Engineering',
    title: 'MLOps: Shipping Models Without Chaos',
    summary:
      'Versioning, deployment patterns, monitoring and retraining, framed as a lifecycle rather than a single release.',
    content: [
      '## The lifecycle',
      'MLOps is the practice of making model development repeatable and model deployment boring. The pieces: versioned data, reproducible training, automated evaluation, a registry, a controlled release, and monitoring after release.',
      '## Data and model versioning',
      'Track exactly which dataset version, code version and parameters produced each model. Without this, a regression six weeks later is untraceable. A model registry with a clear promotion path from candidate to production is what makes that possible.',
      '## Deployment patterns',
      '- **Shadow** - the new model scores live traffic but its output is discarded. Catches latency and distribution surprises with zero risk.',
      '- **Canary** - a small percentage of traffic goes to the new model while metrics are watched.',
      '- **Blue-green** - two identical environments with an instant switch for rollback.',
      '- **Batch** - scheduled scoring over a dataset, simpler and much cheaper than real-time serving.',
      'Pick by risk. A spam classifier does not need a canary. A pricing model probably does.',
      '## Monitoring is the part teams skip',
      'Track four things. **System health**: latency, throughput, error rate. **Data drift**: are incoming feature distributions still like the training set? **Concept drift**: is accuracy decaying on unchanged data? **Business outcome**: is the model still worth its cost?',
      'The first two catch problems early and are cheap. The third is the one that matters most and is the hardest, so budget human-labelled evaluation on a schedule.',
      '## Retraining',
      'Trigger on a schedule, on drift, or on new labels arriving. Always evaluate a candidate against the current production model on the same fresh data, and only promote if it wins. Automatic retraining without an evaluation gate is a way to ship a regression at scale.'
    ].join('\n\n')
  },
  {
    number: 21,
    slug: 'open-source-models',
    category: 'Generative AI',
    title: 'Open-Weight Models and When to Self-Host',
    summary:
      'Licensing, hardware requirements and the real trade-offs between open weights and hosted APIs.',
    content: [
      '## Why teams consider self-hosting',
      '1. **Data control** - prompts and documents never leave your infrastructure, which is often the deciding factor under privacy regulation or contract.',
      '2. **Predictable cost** - a fixed hardware bill instead of per-token pricing that scales with success.',
      '3. **Customisation** - fine-tune on your own data and shape the behaviour precisely.',
      '4. **Latency and residency** - no cross-region round trip, and a fixed location.',
      '5. **Offline capability** - works with no external connectivity at all.',
      '## What it costs',
      'Serving a large model needs GPUs, and inference frameworks such as vLLM or TensorRT-LLM add real operational complexity. You own capacity planning, monitoring, upgrades and the on-call burden when a server dies at 2am. Quantisation helps: 4-bit weights often cut memory needs by a factor of four with only a small quality loss.',
      '## Licensing is not uniform',
      'Open weights does not mean open source by OSI definition. Licences range from fully permissive, to acceptable-use restrictions, to research-only terms, to revenue thresholds. Read the actual licence for the specific model and version, including acceptable-use policies, before shipping anything commercial. This is where self-hosting projects most often go wrong.',
      '## A sensible decision path',
      '1. Prototype with the best available model to find out whether the product works at all.',
      '2. Measure real token volume and latency requirements.',
      '3. If privacy is binding, self-host a smaller capable model and accept a quality trade.',
      '4. If quality is paramount and volume is low, a hosted frontier model plus a strict data agreement is cheaper and better.',
      '5. Consider routing: a small local model handling common cases, a hosted model for hard ones.'
    ].join('\n\n')
  },
  {
    number: 22,
    slug: 'ai-data-pipelines',
    category: 'AI Engineering',
    title: 'Data Quality Is the Real AI Problem',
    summary:
      'Label noise, dataset design, deduplication and leakage, and the unglamorous work that determines results.',
    content: [
      '## Models are data mirrors',
      'When a model performs badly, the first place to look is the data, not the architecture. A model is very good at learning exactly the patterns you gave it, including the wrong ones.',
      '## Label noise',
      'Annotator disagreement sets a noise floor on achievable accuracy. Establish it by having several people label the same batch and measuring agreement. Where agreement is low, the task definition is ambiguous, and no amount of modelling will fix that. Rewrite the guidelines, then re-label.',
      'Prefer a small number of well-trained annotators over a large untrained crowd when quality matters, and keep a hidden test set annotated by your best people.',
      '## Dataset design',
      'Collect examples that match the distribution of real usage, including the awkward tail. A training set of clean, balanced, easy examples produces a model that fails on exactly the difficult real cases. Deliberately over-sample rare but important cases.',
      '## Deduplication and contamination',
      'Duplicate examples act as accidental weighting, and near-duplicates cause memorisation. More dangerously, if your test data also appears in pretraining corpora or in the training set, reported accuracy is fiction. Deduplicate, and check evaluation sets against known benchmark contamination.',
      '## Class imbalance',
      'Imbalanced data makes accuracy misleading. A model predicting the majority class always can look excellent. Use precision and recall per class, the F1 score, and confusion matrices. Rebalance with class weights or resampling, and set the decision threshold where your costs actually sit.',
      '## Practical habits',
      'Version every dataset with a hash, keep a changelog of what was filtered out and why, and log the row counts at every pipeline stage. Most data bugs are found by a simple count that unexpectedly dropped.'
    ].join('\n\n')
  },
  {
    number: 23,
    slug: 'multimodal-ai',
    category: 'Generative AI',
    title: 'Multimodal AI: Models That See and Hear',
    summary:
      'How vision-language and audio models are built, and where they are already genuinely useful.',
    content: [
      '## What multimodal means',
      'A multimodal model accepts or produces more than one kind of signal: images, audio, video, text. Modern systems usually convert each modality into tokens and feed everything through one transformer, so the model reasons over a single unified stream.',
      '## How images become tokens',
      'An image encoder such as a vision transformer divides the picture into patches, projects each into a vector, and produces a sequence of embeddings. A projector maps those into the language model embedding space, after which the text model handles the combined stream. The alignment between the two spaces is trained, not hand-designed.',
      '## Practical capabilities that work now',
      '- **Document understanding** - reading invoices, forms, tables and receipts reliably.',
      '- **Screenshot and UI comprehension** - describing or driving interfaces.',
      '- **Chart and diagram reasoning** - answering questions about figures.',
      '- **Image-grounded Q and A** - answering about a specific photo.',
      '- **Accessibility** - describing images for screen reader users.',
      '- **Video summarisation** - long recordings condensed to key moments.',
      '## Honest limits',
      'Counting many objects, precise spatial relationships, reading small or rotated text, and reasoning across many images in one request are all still weak points. Multi-image reasoning degrades noticeably because attention has to cover far more tokens. On safety, the same capability that reads a benign image can read text that an attacker placed there, so image-based prompt injection deserves real scrutiny.',
      '## Cost and latency',
      'An image can be hundreds or thousands of tokens depending on resolution. For documents, downscaling aggressively and cropping to the relevant region before sending is a large saving with little quality loss, and always cheaper than generating at maximum resolution by default.'
    ].join('\n\n')
  },
  {
    number: 24,
    slug: 'ai-in-business',
    category: 'AI Engineering',
    title: 'A Practical Framework for AI Product Decisions',
    summary:
      'How to decide where AI genuinely belongs in a product, and which ideas to reject despite the hype.',
    content: [
      '## The decision framework',
      'Four questions resolve most cases:',
      '1. **Is there a tolerance for error?** Perfect accuracy rules out most AI. Workflows where a human reviews the output open the door.',
      '2. **Is there ground truth?** If you can check the output automatically, you can automate, retry and improve. Without it, you are guessing.',
      '3. **Does it handle volume or variety?** High volume with low variety is ideal: many similar inputs, one clear definition of correct.',
      '4. **What is the cost of a mistake?** Low cost means you can be aggressive; high cost means the system must inform rather than decide.',
      '## Strong candidates',
      'First drafts and rewrites, classification and routing, search and retrieval over messy documents, summarisation of long material, code assistance, extraction into structured fields, and support agent drafting. In each, a person stays accountable and the model removes drudgery.',
      '## Weak candidates',
      '- Anything requiring perfect recall, such as legal discovery or medical screening',
      '- Decisions that are legally the responsibility of the organisation itself',
      '- Workflows with no way to detect a wrong answer',
      '- Problems whose real bottleneck is process, not information',
      '## Sequence the rollout',
      'Start with an assistive feature and measure the human override rate. High overrides mean either bad quality or bad UX, and you need to know which. Automate only the slice the model handles reliably, and keep a human escalation path. Expect cost per task to fall as the workflow, prompts and model all improve.',
      '## Measure the right thing',
      'Track time saved per task, error rate, adoption, and cost per completed task. Not model quality in isolation, and not request volume. A feature nobody uses saves nothing no matter how clever it is.'
    ].join('\n\n')
  }
];
