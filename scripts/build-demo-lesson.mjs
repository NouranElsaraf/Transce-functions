/**
 * Writes content/imports/integration-water-tank.demo.json — the HAND-AUTHORED
 * demo lesson used for the integration vertical slice (no AI generation).
 * Kept as a script so the JSON stays readable and reviewable in one place.
 * Run: node scripts/build-demo-lesson.mjs
 */
import { writeFile } from 'node:fs/promises';

const ar = (s, en) => (en ? { ar: s, en } : { ar: s });
const PROFILE = [
  [0, 20],
  [3, 50],
  [6, 50],
  [10, 10],
];
const TANK = { profile: PROFILE, initialVolume: 40, capacity: 500 };

const lesson = {
  schemaVersion: 1,
  id: 'integration-water-tank',
  meta: {
    title: ar('الخزان بيتملى بكام؟ التكامل والتراكم', 'How much water accumulates? Integration as accumulation'),
    subject: 'Calculus I',
    topic: 'Definite integral as accumulated change',
    studentLevel: 'first-year-engineering',
    language: 'ar-EG',
    estimatedMinutes: 15,
    tagline: ar('المعدل بيتغير… طب الحجم؟ اكتشف إن المساحة تحت المنحنى هي المية اللي اتجمعت.', 'The rate keeps changing — so how much water? Discover that the area under the curve is the water collected.'),
  },
  provenance: {
    origin: 'demo',
    createdAt: '2026-10-09T00:00:00.000Z',
    note: 'Hand-authored demo content for the vertical slice. NOT AI-generated. Imported through the normal import → validate → preview → review pipeline.',
  },
  objectives: [
    { id: 'o-units', skill: 'unit-distinction', text: ar('يفرّق بين معدل التدفق (لتر/دقيقة) والحجم المتراكم (لتر) والحجم الابتدائي (لتر).', 'Distinguish flow rate (L/min), accumulated volume (L) and initial volume (L).') },
    { id: 'o-area', skill: 'accumulation', text: ar('يفسّر المساحة تحت منحنى المعدل على إنها الحجم اللي اتضاف.', 'Interpret the area under the rate curve as the volume added.') },
    { id: 'o-approx', skill: 'approximation', text: ar('يقرّب الحجم بمجموع مستطيلات ويشرح ليه بيقرب من القيمة المضبوطة لما الفترات تصغر.', 'Approximate the volume with rectangle sums and explain why they approach the exact value as intervals shrink.') },
    { id: 'o-compute', skill: 'transfer', text: ar('يحسب V(t) = V₀ + ∫Q في موقف جديد بأرقام جديدة.', 'Compute V(t) = V₀ + ∫Q in a new situation with new values.') },
  ],
  prerequisites: [
    { id: 'p-rate', levelRef: 'speed-detective', text: ar('فاهم يعني إيه معدل تغيّر (زي السرعة: متر لكل ثانية).', 'Knows what a rate of change is (like speed in m/s).') },
    { id: 'p-area', text: ar('بيعرف يحسب مساحة مستطيل وشبه منحرف.', 'Can compute the area of a rectangle and a trapezoid.') },
  ],
  sources: [
    { id: 's-openstax-areas', title: 'Calculus Volume 1, §5.1 Approximating Areas', publisher: 'OpenStax (Rice University)', url: 'https://openstax.org/books/calculus-volume-1/pages/5-1-approximating-areas', accessed: '2026-10-09', supports: 'Left/right-endpoint rectangle sums are Riemann sums; they give better approximations as n grows, and the exact area is their limit.' },
    { id: 's-openstax-net-change', title: 'Calculus Volume 1, §5.4 Integration Formulas and the Net Change Theorem', publisher: 'OpenStax (Rice University)', url: 'https://openstax.org/books/calculus-volume-1/pages/5-4-integration-formulas-and-the-net-change-theorem', accessed: '2026-10-09', supports: 'Net change theorem F(b) = F(a) + ∫ F′; Example 5.26 integrates a fuel-consumption rate to get fuel used.' },
    { id: 's-usgs-streamflow', title: 'How Streamflow is Measured', publisher: 'U.S. Geological Survey, Water Science School', url: 'https://www.usgs.gov/special-topics/water-science-school/science/how-streamflow-measured', accessed: '2026-10-09', supports: 'Discharge is the volume of water moving down a stream per unit time (e.g. cubic feet per second).' },
  ],
  context: {
    everyday: [
      { text: ar('خزان السطح: المية بتيجي ضعيفة الصبح بدري وبتقوى بعدين. اللي يهمك مش «المية جاية بقوة قد إيه دلوقتي»، اللي يهمك «الخزان فيه كام لتر».', 'A rooftop tank: water pressure changes during the day. What matters is how many litres are in the tank, not just how fast it flows right now.') },
      { text: ar('طلمبة البنزين بتعرض اللترات اللي نزلت، مش بس سرعة النزول: هي بتجمع المعدل على الوقت.', 'A fuel pump shows litres delivered, not just the flow speed: it accumulates the rate over time.') },
    ],
    engineering: [
      { text: ar('مهندسين الري والموارد المائية بيقيسوا «التصرف» في الترع والأنهار (حجم مية لكل وحدة زمن)، ومن جمعه على الوقت بيعرفوا حجم المية اللي عدّت.', 'Water-resources engineers measure discharge (volume per time) in canals and rivers and integrate it over time to get the volume that passed.'), sourceIds: ['s-usgs-streamflow'] },
      { text: ar('في المحركات: معدل استهلاك الوقود (لتر/ساعة) لو اتكامل على مدة الرحلة بيدّي الوقود اللي اتصرف.', 'Engines: integrating the fuel-consumption rate (L/h) over a trip gives the fuel used.'), sourceIds: ['s-openstax-net-change'] },
    ],
    assumptions: [
      ar('مفيش مية خارجة من الخزان طول التجربة (مفيش استهلاك).', 'No water leaves the tank during the experiment.'),
      ar('المعدل بيتغير بخط مستقيم بين النقط المقاسة.', 'The rate changes linearly between measured points.'),
      ar('مقطع الخزان ثابت، فارتفاع المية بيتناسب مع الحجم.', 'The tank has a constant cross-section, so water height is proportional to volume.'),
    ],
    units: [
      { symbol: 'Q(t)', quantity: ar('معدل التدفق'), unit: ar('لتر/دقيقة') },
      { symbol: 't', quantity: ar('الزمن'), unit: ar('دقيقة') },
      { symbol: 'V(t)', quantity: ar('الحجم في الخزان'), unit: ar('لتر') },
      { symbol: 'V₀', quantity: ar('الحجم الابتدائي'), unit: ar('لتر') },
    ],
    limitations: [
      ar('في الحقيقة المعدل بيتذبذب ومش خطي بالظبط، والقياس بيتاخد على فترات.', 'Real flow fluctuates and is sampled at intervals.'),
      ar('لما الخزان يتملى، الزيادة بتطلع من ماسورة الفايض: الموديل بيحسبها «مية فايضة» بدل ما يخليها تختفي.', 'When full, extra water leaves through the overflow pipe; the model counts it as spilled instead of letting it vanish.'),
      ar('الدرس ده بيتعامل مع مية داخلة بس (معدل موجب). السحب (معدل سالب) درس تاني.', 'This lesson covers inflow only (non-negative rate); outflow is a later lesson.'),
    ],
  },
  misconceptions: [
    { id: 'm-rate-is-volume', text: ar('«المعدل هو الحجم»: لو المعدل ٥٠ يبقى في الخزان ٥٠ لتر.'), why: ar('المعدل بيقولك بتزيد بسرعة قد إيه (لتر كل دقيقة)، مش فيه كام لتر. الحجم بييجي من تجميع المعدل على الوقت.') },
    { id: 'm-last-rate-times-time', text: ar('«الحجم = آخر معدل × الوقت كله».'), why: ar('ده بيفترض إن المعدل كان ثابت طول الوقت على آخر قيمة. لما المعدل بيتغير لازم تجمع شرايح، يعني المساحة تحت المنحنى.') },
    { id: 'm-forget-initial', text: ar('«نسيان المية اللي كانت موجودة من الأول (V₀)».'), why: ar('التكامل بيدّيك اللي «اتضاف» بس. الحجم الكلي = اللي كان موجود + اللي اتضاف.') },
    { id: 'm-height-not-area', text: ar('«الحجم هو ارتفاع منحنى المعدل عند اللحظة دي».'), why: ar('الارتفاع هو المعدل في اللحظة دي. الحجم المتراكم هو المساحة من البداية لحد اللحظة دي.') },
    { id: 'm-more-rects-exact', text: ar('«مجموع المستطيلات بيبقى مضبوط عند عدد معين وخلاص».'), why: ar('المجموع بيقرب أكتر وأكتر كل ما تزوّد المستطيلات، والقيمة المضبوطة هي النهاية (limit). مع منحنى بيتغير، أي n محدود فيه غلط صغير.') },
  ],
  assessments: [
    {
      id: 'a-predict', objectiveIds: ['o-area'], kind: 'prediction', format: 'numeric',
      prompt: ar('من غير حسابات طويلة: بعد ١٠ دقايق، تتوقع يبقى في الخزان كام لتر تقريبًا؟'),
      numeric: { answer: { compute: 'volume-at', args: { ...TANK, t: 10 } }, unit: ar('لتر'), tolerance: { type: 'relative', value: 0.15 }, explain: ar('اتضاف حوالي ٣٧٥ لتر (المساحة تحت المنحنى) فوق الـ ٤٠ اللي كانوا موجودين.') },
      feedback: { correct: ar('توقع حلو! خلّينا نشوف ليه الرقم ده منطقي.'), wrong: ar('مش مشكلة، التوقع ده عشان تقارن بعدين. خلي بالك: المعدل اتغير، ومتنساش الـ ٤٠ لتر الأولانيين.') },
      misconceptionIds: ['m-last-rate-times-time', 'm-forget-initial'],
    },
    {
      id: 'a-area', objectiveIds: ['o-area'], kind: 'reasoning', format: 'choice',
      prompt: ar('المية اللي اتضافت من دقيقة ٠ لحد دقيقة ٦ بتظهر في رسمة المعدل إزاي؟'),
      choice: {
        options: [
          { id: 'height', text: ar('ارتفاع المنحنى عند دقيقة ٦'), correct: false, misconceptionId: 'm-height-not-area', feedback: ar('الارتفاع عند ٦ هو المعدل في اللحظة دي (٥٠ لتر/دقيقة)، مش اللترات اللي اتجمعت.') },
          { id: 'area', text: ar('المساحة تحت المنحنى من ٠ لـ ٦'), correct: true, feedback: ar('بالظبط: كل شريحة صغيرة = معدل × زمن = لترات، وجمعهم هو المساحة.') },
          { id: 'slope', text: ar('ميل المنحنى عند دقيقة ٦'), correct: false, misconceptionId: 'm-height-not-area', feedback: ar('الميل بيقولك المعدل نفسه بيتغير بسرعة قد إيه، مش كمية المية.') },
          { id: 'start', text: ar('النقطة اللي المنحنى بدأ منها'), correct: false, misconceptionId: 'm-forget-initial', feedback: ar('دي قيمة المعدل في الأول (٢٠ لتر/دقيقة). المية اللي كانت في الخزان (٤٠ لتر) مش باينة في رسمة المعدل أصلًا.') },
        ],
      },
      feedback: { correct: ar('صح. المساحة تحت منحنى المعدل = الحجم اللي اتضاف.'), wrong: ar('بص على الشريحة الصغيرة: عرضها زمن، وارتفاعها معدل… حاصل ضربهم وحدته إيه؟') },
      hints: [ar('عرض الشريحة بالدقايق وارتفاعها باللتر/دقيقة. اضربهم في بعض: الوحدة بتبقى لتر.')],
    },
    {
      id: 'a-riemann', objectiveIds: ['o-approx'], kind: 'reasoning', format: 'numeric',
      prompt: ar('استخدم ٥ مستطيلات من الشمال (كل واحد عرضه دقيقتين). مجموع مساحاتهم كام لتر؟ (استعمل الرسمة)'),
      numeric: { answer: { compute: 'riemann', args: { profile: PROFILE, a: 0, b: 10, n: 5, method: 'left' } }, unit: ar('لتر'), tolerance: { type: 'absolute', value: 1 }, explain: ar('الارتفاعات عند ٠، ٢، ٤، ٦، ٨ هي ٢٠، ٤٠، ٥٠، ٥٠، ٣٠. المجموع × العرض ٢ = ٣٨٠ لتر.') },
      feedback: { correct: ar('مظبوط: ٣٨٠ لتر، قريب من القيمة المضبوطة ٣٧٥ بس مش هي.'), wrong: ar('خد ارتفاع المنحنى عند بداية كل فترة (٠، ٢، ٤، ٦، ٨)، اضربه في ٢، واجمع.') },
      hints: [ar('المستطيل الأول: ارتفاعه Q(0) = 20 وعرضه ٢ دقيقة → ٤٠ لتر.')],
      misconceptionIds: ['m-height-not-area'],
    },
    {
      id: 'a-converge', objectiveIds: ['o-approx'], kind: 'prediction', format: 'choice',
      prompt: ar('لو زوّدنا عدد المستطيلات من ٥ لـ ٦٠، الفرق بين المجموع والقيمة المضبوطة هيعمل إيه؟'),
      choice: {
        options: [
          { id: 'grow', text: ar('هيكبر'), correct: false, misconceptionId: 'm-more-rects-exact', feedback: ar('جرّب بالسلايدر: الشرايح الرفيعة بتلبس على المنحنى أحسن، فالغلط بيقل.') },
          { id: 'shrink', text: ar('هيصغر ويقرب من الصفر'), correct: true, feedback: ar('بالظبط. والقيمة اللي المجموع بيقرب منها هي التكامل.') },
          { id: 'same', text: ar('هيفضل زي ما هو'), correct: false, misconceptionId: 'm-more-rects-exact', feedback: ar('بص على رقم «الفرق» وإنت بتحرّك السلايدر. مش ثابت.') },
          { id: 'zero', text: ar('هيبقى صفر بالظبط عند أي عدد كبير'), correct: false, misconceptionId: 'm-more-rects-exact', feedback: ar('بيقرب جدًا من الصفر، بس مع منحنى بيتغير أي عدد محدود فيه غلط صغير. المضبوط هو النهاية.') },
        ],
      },
      feedback: { correct: ar('صح. ده بالظبط تعريف التكامل: نهاية مجموع المستطيلات.'), wrong: ar('جرّب السلايدر وبص على عمود «الفرق».') },
    },
    {
      id: 'a-units', objectiveIds: ['o-units'], kind: 'reasoning', format: 'choice',
      prompt: ar('في المعادلة V(t) = V₀ + ∫Q dτ، أنهي حاجة وحدتها «لتر/دقيقة»؟'),
      choice: {
        options: [
          { id: 'opt-v', text: ar('الرمز V(t)'), correct: false, misconceptionId: 'm-rate-is-volume', feedback: ar('V(t) حجم: وحدته لتر.') },
          { id: 'opt-v0', text: ar('الرمز V₀'), correct: false, misconceptionId: 'm-forget-initial', feedback: ar('V₀ هو اللي كان في الخزان من الأول: لتر.') },
          { id: 'opt-q', text: ar('الرمز Q(τ)'), correct: true, feedback: ar('صح: Q معدل. ولما تضربه في dτ (دقايق) يطلع لترات، فالتكامل كله لترات.') },
          { id: 'opt-dt', text: ar('الرمز dτ'), correct: false, misconceptionId: 'm-rate-is-volume', feedback: ar('dτ شريحة زمن صغيرة: وحدتها دقيقة.') },
        ],
      },
      feedback: { correct: ar('تمام: الوحدات بتمشي صح. لتر = لتر + (لتر/دقيقة × دقيقة).'), wrong: ar('راجع جدول الوحدات تحت المعادلة.') },
    },
    {
      id: 'a-practice', objectiveIds: ['o-compute', 'o-units'], kind: 'transfer', format: 'numeric',
      prompt: ar('تمرين بمساعدة: خزان فيه ١٠٠ لتر، والمية بتدخل بمعدل ثابت ٣٠ لتر/دقيقة لمدة ٤ دقايق. هيبقى فيه كام لتر؟'),
      numeric: { answer: { compute: 'constant-flow-volume', args: { rate: 30, minutes: 4, initialVolume: 100 } }, unit: ar('لتر'), tolerance: { type: 'absolute', value: 0.5 }, explain: ar('المساحة مستطيل: ٣٠ × ٤ = ١٢٠ لتر اتضافوا، + ١٠٠ كانوا موجودين = ٢٢٠ لتر.') },
      feedback: { correct: ar('برافو: ١٢٠ لتر اتضافوا فوق الـ ١٠٠.'), wrong: ar('ارسم المعدل: خط أفقي عند ٣٠. المساحة تحته لحد ٤ دقايق قد إيه؟ ومتنساش الـ ١٠٠.') },
      hints: [ar('الخطوة ١: المساحة = ٣٠ لتر/دقيقة × ٤ دقايق.'), ar('الخطوة ٢: ضيف الحجم الابتدائي.')],
      misconceptionIds: ['m-forget-initial', 'm-rate-is-volume'],
    },
    {
      id: 'a-closed', objectiveIds: ['o-units'], kind: 'reasoning', format: 'choice',
      prompt: ar('المحبس اتقفل خالص عند دقيقة ١٠ (يعني Q = 0). الحجم في الخزان بعدها…'),
      choice: {
        options: [
          { id: 'zero', text: ar('يبقى صفر'), correct: false, misconceptionId: 'm-rate-is-volume', feedback: ar('المعدل صفر يعني مفيش زيادة، مش إن الخزان فضي.') },
          { id: 'hold', text: ar('يفضل ثابت على آخر قيمة'), correct: true, feedback: ar('صح: مفيش مية داخلة ولا خارجة، فالحجم واقف.') },
          { id: 'back', text: ar('يرجع لـ V₀'), correct: false, misconceptionId: 'm-forget-initial', feedback: ar('المية اللي اتضافت مش هتختفي لوحدها.') },
          { id: 'down', text: ar('يقل بالتدريج'), correct: false, misconceptionId: 'm-rate-is-volume', feedback: ar('عشان يقل لازم يبقى فيه سحب (معدل سالب)، وده مش حاصل هنا.') },
        ],
      },
      feedback: { correct: ar('بالظبط: Q = 0 معناه الرسمة بتاعة الحجم بقت أفقية.'), wrong: ar('افتكر: Q بيقول الحجم «بيتغير» بسرعة قد إيه.') },
    },
    {
      id: 'a-challenge', objectiveIds: ['o-compute', 'o-area'], kind: 'transfer', format: 'numeric',
      prompt: ar('تحدي بأرقام جديدة: خزان كبير فيه {initialVolume} لتر. المعدل بيزيد بانتظام من {q0} لـ {q1} لتر/دقيقة على مدار {duration} دقايق. هيبقى فيه كام لتر في الآخر؟'),
      numeric: {
        generator: { compute: 'ramp-volume', ranges: { q0: [10, 30, 5], q1: [40, 70, 10], duration: [4, 8, 2], initialVolume: [50, 150, 25] } },
        unit: ar('لتر'),
        tolerance: { type: 'relative', value: 0.01 },
        explain: ar('المساحة تحت خط مستقيم = متوسط المعدل × الزمن = (({q0} + {q1}) ÷ 2) × {duration}. وبعدين ضيف {initialVolume}.'),
      },
      feedback: { correct: ar('عاش! حليت موقف جديد بنفس الفكرة: الحجم = اللي كان موجود + المساحة تحت المعدل.'), wrong: ar('المساحة هنا شبه منحرف: متوسط المعدلين × الزمن. وبعدين متنساش الحجم الابتدائي.') },
      hints: [ar('ارسم المعدل: خط مايل من {q0} لـ {q1}. المساحة تحته شبه منحرف.')],
      misconceptionIds: ['m-last-rate-times-time', 'm-forget-initial'],
    },
  ],
  stages: [
    {
      id: 'st-problem', phase: 'problem',
      title: ar('مشكلة حقيقية: خزان السطح'),
      body: ar('عندك خزان سعته ٥٠٠ لتر وفيه ٤٠ لتر. المية بتيجي من المحبس بمعدل بيتغير: ضعيفة في الأول، بتقوى، وبعدين تضعف تاني. العداد بيقيس المعدل بس. السؤال: بعد ١٠ دقايق هيبقى فيه كام لتر؟ وهل هيفيض؟'),
      interaction: { type: 'flow-tank', params: { ...TANK, duration: 10, controls: [], showArea: false } },
    },
    {
      id: 'st-predict', phase: 'prediction',
      title: ar('توقّع الأول'),
      body: ar('قبل ما نجرّب: اكتب توقعك. مفيش حساب طويل، استخدم إحساسك من شكل الرسمة.'),
      interaction: { type: 'question', params: {} },
      assessmentIds: ['a-predict'],
    },
    {
      id: 'st-experiment', phase: 'experiment',
      title: ar('جرّب بنفسك'),
      body: ar('شغّل الوقت أو حرّكه. لاحظ: الخزان والرسمة ماشيين مع بعض. الجزء المتظلل تحت المنحنى بيكبر بنفس سرعة المية في الخزان. جرّب كمان تفتح المحبس أكتر وشوف امتى يفيض.'),
      interaction: { type: 'flow-tank', params: { ...TANK, duration: 10, controls: ['play', 'time', 'valve'], showArea: true } },
      assessmentIds: ['a-area'],
    },
    {
      id: 'st-explainer', phase: 'explanation',
      title: ar('شرح متحرك'),
      body: ar('فيديو قصير (حوالي ٤٨ ثانية) بيوصّل الفكرة: كل شريحة زمن صغيرة = معدل × زمن = لترات.'),
      interaction: { type: 'explainer', params: { ...TANK, duration: 10 } },
    },
    {
      id: 'st-riemann', phase: 'explanation',
      title: ar('قسّمها مستطيلات'),
      body: ar('المساحة تحت منحنى بيتغير صعبة. الحل: نقسّم الوقت فترات، ونعتبر المعدل ثابت جوا كل فترة. كل مستطيل = معدل × زمن. صغّر الفترات وشوف المجموع رايح فين.'),
      interaction: { type: 'riemann-sum', params: { profile: PROFILE, a: 0, b: 10, nMin: 1, nMax: 60, initialN: 5, methods: ['left', 'right', 'midpoint'] } },
      assessmentIds: ['a-riemann', 'a-converge'],
    },
    {
      id: 'st-equation', phase: 'equation',
      title: ar('دلوقتي بس: المعادلة'),
      body: ar('اللي شفته بعينك نكتبه بالرموز: الحجم دلوقتي = اللي كان موجود + المساحة تحت منحنى المعدل من البداية لحد دلوقتي.'),
      reveal: ar('علامة التكامل ∫ أصلها حرف S ممطوط، من كلمة Sum (مجموع): مجموع شرايح صغيرة جدًا.'),
      interaction: {
        type: 'equation',
        params: {
          tokens: [
            { kind: 'var', value: 'V(t)' },
            { kind: 'op', value: '=' },
            { kind: 'sub', base: 'V', value: '0' },
            { kind: 'op', value: '+' },
            { kind: 'int', lower: '0', upper: 't' },
            { kind: 'var', value: 'Q(τ)' },
            { kind: 'text', value: 'dτ' },
          ],
          legend: [
            { symbol: 'V(t)', meaning: ar('الحجم في الخزان عند الزمن t'), unit: 'L' },
            { symbol: 'V₀', meaning: ar('الحجم الابتدائي'), unit: 'L' },
            { symbol: 'Q(τ)', meaning: ar('معدل التدفق عند اللحظة τ'), unit: 'L/min' },
            { symbol: 'dτ', meaning: ar('شريحة زمن صغيرة جدًا'), unit: 'min' },
          ],
        },
      },
      assessmentIds: ['a-units'],
    },
    {
      id: 'st-practice', phase: 'practice',
      title: ar('تمرين بمساعدة'),
      body: ar('هنحل سوا. استخدم التلميحات لو احتجت.'),
      interaction: { type: 'question', params: {} },
      assessmentIds: ['a-practice', 'a-closed'],
    },
    {
      id: 'st-challenge', phase: 'challenge',
      title: ar('تحدي لوحدك'),
      body: ar('أرقام جديدة، نفس الفكرة. كل محاولة جديدة بتطلعلك أرقام مختلفة.'),
      interaction: { type: 'question', params: {} },
      assessmentIds: ['a-challenge'],
    },
  ],
  animation: {
    durationSec: 48,
    timeline: [
      { id: 'e1', t0: 0, t1: 6, action: 'scene', params: { focus: 'tank' } },
      { id: 'e2', t0: 6, t1: 14, action: 'scene', params: { focus: 'meter' } },
      { id: 'e3', t0: 14, t1: 24, action: 'fill', params: { from: 0, to: 3 } },
      { id: 'e4', t0: 14, t1: 24, action: 'shade', params: { from: 0, to: 3 } },
      { id: 'e5', t0: 24, t1: 32, action: 'fill', params: { from: 3, to: 6 } },
      { id: 'e6', t0: 24, t1: 32, action: 'shade', params: { from: 3, to: 6 } },
      { id: 'e7', t0: 24, t1: 32, action: 'label', params: { target: 'graph', text: ar('مستطيل: ٥٠ × ٣ = ١٥٠ لتر') } },
      { id: 'e8', t0: 32, t1: 40, action: 'fill', params: { from: 6, to: 10 } },
      { id: 'e9', t0: 32, t1: 40, action: 'shade', params: { from: 6, to: 10 } },
      { id: 'e10', t0: 32, t1: 40, action: 'rectangles', params: { from: 2, to: 20, method: 'midpoint' } },
      { id: 'e11', t0: 40, t1: 46, action: 'equation', params: {} },
    ],
    captions: [
      { t0: 0, t1: 6, text: ar('ده خزان سعته ٥٠٠ لتر، وفيه ٤٠ لتر من الأول.') },
      { t0: 6, t1: 14, text: ar('العداد ده بيقيس معدل التدفق: كام لتر بيدخل كل دقيقة. مش بيقول الخزان فيه كام.') },
      { t0: 14, t1: 24, text: ar('في أول ٣ دقايق المعدل بيزيد من ٢٠ لـ ٥٠ لتر في الدقيقة… والمية بتعلى، والمساحة تحت المنحنى بتكبر معاها.') },
      { t0: 24, t1: 32, text: ar('لما المعدل ثابت ٥٠، كل دقيقة بتضيف ٥٠ لتر: المساحة مستطيل ارتفاعه ٥٠ وعرضه ٣ دقايق.') },
      { t0: 32, t1: 40, text: ar('قسّم الوقت لشرايح: كل شريحة معدل في زمن يعني لترات. كل ما الشرايح تصغر، المجموع يقرب من المساحة بالظبط.') },
      { t0: 40, t1: 48, text: ar('الحجم = اللي كان موجود + المساحة تحت منحنى المعدل. ده هو التكامل.') },
    ],
    narration: { status: 'none', assets: [] },
  },
};

await writeFile(new URL('../content/imports/integration-water-tank.demo.json', import.meta.url), `${JSON.stringify(lesson, null, 2)}\n`);
console.log('wrote content/imports/integration-water-tank.demo.json');
