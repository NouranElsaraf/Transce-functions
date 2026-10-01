/**
 * Level 7 lesson companion (see SpeedDetective/lesson.js for the shape).
 * @module EscapeRoom/lesson
 */
export default {
  reality: {
    en: [
      'Every lock used an idea from the real world: braking cars, spreading rumours, signals, hanging cables.',
      'Finding where the slope is zero is how apps find the cheapest flight or the shortest route.',
      'Doubling riddles are how epidemiologists warn about an outbreak before it looks big.',
    ],
    ar: [
      'كل قفل استخدم فكرة من الحقيقة: عربيات بتفرمل، إشاعات بتنتشر، إشارات، وكابلات متعلقة.',
      'إنك تدوّر على الميل صفر هي نفس الطريقة اللي التطبيقات بتلاقي بيها أرخص طيارة أو أقصر طريق.',
      'ألغاز التضاعف دي هي اللي علماء الأوبئة بيحذّروا بيها من انتشار مرض قبل ما يبان كبير.',
    ],
  },
  engineer: {
    en: [
      'Optimisation: engineers set the derivative to zero to minimise material, cost or energy.',
      'System identification: reading period, amplitude and growth rate off measured signals.',
      'Choosing the right model: periodic (trig), growing or decaying (exponential), hanging or sagging (hyperbolic).',
    ],
    ar: [
      'التحسين (Optimization): المهندس بيخلّي المشتقة = صفر عشان يقلّل الخامات أو التكلفة أو الطاقة.',
      'تحليل الأنظمة: قراية زمن الدورة والسعة ومعدل النمو من إشارات متقاسة.',
      'اختيار الموديل الصح: دوري (مثلثات)، بيكبر أو بيصغر (أُسّي)، ولا متعلق ومترخّم (زائدي).',
    ],
  },
  misconceptions: [
    {
      en: ['Zero slope always means a maximum.', 'It can be a maximum, a minimum or a flat pause. Check what the curve does on each side.'],
      ar: ['«الميل صفر يبقى أكبر قيمة دايمًا»', 'ممكن تكون أكبر قيمة أو أصغر قيمة أو وقفة مفرودة. بص المنحنى بيعمل إيه على الناحيتين.'],
    },
    {
      en: ['Half full means half the time.', 'With doubling, half full is just one step before full.'],
      ar: ['«نص مليان يعني نص الوقت»', 'مع التضاعف، نص مليان يعني خطوة واحدة بس قبل ما يتملي.'],
    },
    {
      en: ['Peak to valley is one period.', 'A period runs between two points doing the same thing in the same direction: peak to peak, not peak to valley.'],
      ar: ['«من القمة للقاع دورة كاملة»', 'الدورة بين نقطتين بيعملوا نفس الحاجة في نفس الاتجاه: من قمة لقمة، مش من قمة لقاع.'],
    },
  ],
  steps: {
    tangent: {
      ask: { en: 'What does “flat” mean for the rate of change?', ar: 'يعني إيه «مفرود» بالنسبة لمعدل التغير؟' },
      masry: [
        'القفل ده بيفتح بس عند النقطة اللي المماس فيها أفقي. افتكر قمة التل وقاع الوادي.',
        'الميل صفر يعني المنحنى بطّل يطلع وهيبدأ ينزل (أو العكس). دي من أهم أفكار التفاضل: عشان تلاقي أكبر أو أصغر قيمة، دوّر على الميل صفر.',
      ],
    },
    jar: {
      ask: { en: 'Run the clock backwards: what does one doubling undo into?', ar: 'رجّع الساعة لورا: تضعيفة واحدة لو رجّعناها بتبقى إيه؟' },
      masry: [
        'الإجابة اللي بتيجي في دماغك الأول غالبًا غلط. فكّر بالعكس من الآخر.',
        'قبل ما يتملي بدقيقة واحدة كان نصه: ١١:٥٩. في النمو الأُسّي آخر لحظات فيها معظم الحدث، زي يوم ٣٠ في المملكة.',
      ],
    },
    shape: {
      ask: { en: 'Which changes act on heights, and which act on x?', ar: 'أنهي تغييرات بتأثر على الارتفاع، وأنهي بتأثر على x؟' },
      masry: [
        'القاع عند x = −١ وارتفاعه −٢، وهو أضيق من الطبق العادي. ابدأ باللي برا وبعدين اللي جوا.',
        'برا (×٢ و−٢) بيغيّر الارتفاعات، وجوا (+١) بيزحزح المكان للشمال. نفس قواعد النحّات بالظبط.',
      ],
    },
    wave: {
      ask: { en: 'Find a peak. Where is the next identical one?', ar: 'دوّر على قمة. فين القمة اللي زيها بالظبط بعدها؟' },
      masry: [
        'متعدّش القمم وخلاص؛ اتأكد إن الموجة بتعمل نفس الحركة في نفس الاتجاه.',
        '٣ موجات في ٣٦٠° يعني كل موجة ١٢٠°. اللف كان أسرع ٣ مرات من الـ sin العادي.',
      ],
    },
    chain: {
      ask: { en: 'Near the middle they all look alike. What happens far out?', ar: 'في النص كلهم شبه بعض. إيه اللي بيحصل بعيد؟' },
      masry: [
        'منحنى منهم بيتكرر، وواحد بيطلع زي التربيع، وواحد بينفجر. اقرا اللغز تاني بالراحة.',
        'B هو الـ cosh: متماثل وأقل قيمة ليه ١، بس بعيد عن النص بيبقى تقريبًا نص eˣ وبينفجر.',
      ],
    },
    door: {
      ask: { en: 'Read the digits off the lock strip. Do they remind you of a famous number?', ar: 'اقرا الأرقام من شريط الأقفال. فكّرتك برقم مشهور؟' },
      masry: [
        'جمعت ٥ أرقام. اكتبهم بالترتيب واخرج.',
        '٢.٧١٨٢… ده الـ e! الرقم اللي بينمو بنفس سرعة قيمته. خرجت من الأوضة بالفهم مش بالحفظ. برافو عليك.',
      ],
      bridge: {
        en: [
          'e appears whenever the rate of change is proportional to the amount, which is almost everywhere in nature and engineering.',
          'Continuously compounded interest, population growth, cooling.',
          'Circuit transients, radioactive decay, reaction rates and signal damping are all written with e.',
        ],
        ar: [
          'الـ e بيظهر في أي حتة معدل التغير فيها بنسبة من الكمية، ودي تقريبًا كل حتة في الطبيعة والهندسة.',
          'الفايدة المركبة المستمرة، زيادة السكان، والتبريد.',
          'شحن وتفريغ الدواير، التحلل الإشعاعي، معدلات التفاعل، وتخميد الإشارات كلها بتتكتب بالـ e.',
        ],
      },
    },
  },
};
