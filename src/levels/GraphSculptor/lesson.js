/**
 * Level 3 lesson companion (see SpeedDetective/lesson.js for the shape).
 * @module GraphSculptor/lesson
 */
export default {
  reality: {
    en: [
      'Photo editing apps shift, scale and flip images: the same transformations, applied to pixels.',
      'Time zones: the same daily cycle, shifted left or right.',
      'A music player’s volume and speed controls stretch a sound wave vertically or horizontally.',
    ],
    ar: [
      'برامج تعديل الصور بتزحزح وتكبّر وتقلب: نفس التحويلات دي بس على البكسل.',
      'فرق التوقيت بين البلاد: نفس اليوم بس متزحزح يمين أو شمال.',
      'زرار الصوت والسرعة في مشغّل الأغاني بيشدّ الموجة الصوتية رأسي أو أفقي.',
    ],
  },
  engineer: {
    en: [
      'Calibration: correcting a sensor’s offset (+k) and gain (×a).',
      'Signals: delays, phase shifts and frequency scaling in communication systems.',
      'Structures: shifting and scaling a standard load curve to fit a particular bridge or building.',
    ],
    ar: [
      'المعايرة: تصحيح الـ offset (+k) والـ gain (×a) بتوع الحساس.',
      'الإشارات: التأخير وفرق الطور وتغيير التردد في أنظمة الاتصالات.',
      'الإنشاءات: إزاحة وتكبير منحنى أحمال قياسي عشان يناسب كوبري أو مبنى معين.',
    ],
  },
  misconceptions: [
    {
      en: ['f(x + 3) moves the graph to the right.', 'It moves left: whatever used to happen at x = 0 now happens at x = −3.'],
      ar: ['«f(x + 3) بتحرّك الرسمة يمين»', 'بتحرّكها شمال: اللي كان بيحصل عند x = 0 بقى بيحصل عند x = −3.'],
    },
    {
      en: ['2·f(x) and f(2x) are the same thing.', '2·f(x) is twice as tall; f(2x) is squeezed sideways. Outside acts on heights, inside acts on x.'],
      ar: ['«2·f(x) هي هي f(2x)»', '2·f(x) أطول مرتين، أما f(2x) متضغوطة بالعرض. برا بيأثر على الارتفاع وجوا بيأثر على x.'],
    },
    {
      en: ['f(2x) stretches the graph wider.', 'It squeezes it: every height is reached at half the x. Multiplying inside works backwards, just like adding inside.'],
      ar: ['«f(2x) بتعرّض الرسمة»', 'بالعكس بتضغطها: كل ارتفاع بيوصله عند نص الـ x. الضرب جوا شغال بالعكس زي الجمع جوا بالظبط.'],
    },
  ],
  steps: {
    lift: {
      ask: { en: 'Only one control. Before touching it, what do you expect it to do to the whole curve?', ar: 'زرار واحد بس. قبل ما تلمسه: تتوقع يعمل إيه في المنحنى كله؟' },
      masry: [
        'عندك منحنى (الخط الصلب) وشبح (المتقطع). هدفك تركّب الاتنين على بعض.',
        'لما تزوّد على الناتج، كل نقطة بتطلع لفوق بنفس القيمة. الشكل نفسه متغيرش، بس اتنقل لفوق.',
      ],
      bridge: {
        en: [
          'Shifting the output lets one model fit different starting levels.',
          'Measuring your height from the floor or from the table top: same shape, different zero.',
          'Electronics adds a DC offset to an AC signal; surveyors set a reference level (datum) the same way.',
        ],
        ar: [
          'إنك تزوّد على الناتج بيخليك تستخدم نفس الموديل مع نقطة بداية مختلفة.',
          'لو قست طولك من الأرض أو من على الترابيزة: نفس الشكل، بس الصفر اتغير.',
          'في الإلكترونيات بنضيف DC offset لإشارة AC، وفي المساحة بنحدد منسوب مرجعي بنفس الطريقة.',
        ],
      },
    },
    slide: {
      ask: { en: 'Predict first: adding 3 to x, does the bowl move left or right? Commit before you test.', ar: 'توقّع الأول: لما نزوّد ٣ على x الطبق يروح يمين ولا شمال؟ اختار قبل ما تجرّب.' },
      masry: [
        'معظم الناس بيقولوا يمين عشان «زائد». خلّي بالك: إحنا بنزوّد على x قبل ما نربّع. فكّر: قاع الطبق هيبقى فين؟',
        'القاع بيحصل لما اللي جوا القوس يبقى صفر: x + 3 = 0 يعني x = −3. عشان كده الزيادة جوا بتشد المنحنى للشمال، كأن كل حاجة بتحصل «بدري» ٣ خطوات.',
      ],
      bridge: {
        en: [
          'Shifting the input means the same event happens earlier or later.',
          'A TV episode recorded 3 hours earlier: the same show, shifted in time.',
          'Time delays and phase shifts in signals and control systems: f(t − τ) is the same signal arriving τ seconds late.',
        ],
        ar: [
          'إنك تزحزح المدخل يعني نفس الحدث بيحصل بدري أو متأخر.',
          'حلقة مسلسل متسجلة قبلها بـ٣ ساعات: نفس الحلقة بس متزحزحة في الوقت.',
          'التأخير الزمني وفرق الطور في الإشارات وأنظمة التحكم: f(t − τ) هي نفس الإشارة واصلة متأخرة τ ثانية.',
        ],
      },
    },
    stretch: {
      ask: { en: 'Which control changes the height, and which changes how often the wave repeats?', ar: 'أنهي زرار بيغيّر الارتفاع، وأنهي بيغيّر الموجة بتتكرر كل قد إيه؟' },
      masry: [
        'الشكل دلوقتي موجة. شبح منهم أطول، والتاني موجاته أكتر. جرّب تضرب الناتج مرة، وتضرب x مرة.',
        'الضرب برا = الموجة أطول (شد رأسي). الضرب جوا = الموجة أسرع وأضيق (ضغط أفقي). وده بالظبط الفرق بين صوت عالي وصوت حاد.',
      ],
      bridge: {
        en: [
          'Stretching outside changes the size; squeezing inside changes the rate.',
          'Turning up the volume (a taller wave) is different from singing a higher note (a faster wave).',
          'An amplifier’s gain multiplies the output while frequency multiplies time: 2·sin(t) versus sin(2t).',
        ],
        ar: [
          'الشد برا بيغيّر الحجم، والضغط جوا بيغيّر السرعة.',
          'إنك تعلّي الصوت (موجة أطول) غير إنك تغني نغمة أحدّ (موجة أسرع).',
          'الـ gain في الأمبليفاير بيضرب الناتج، والتردد بيضرب الزمن: 2·sin(t) غير sin(2t).',
        ],
      },
    },
    mirror: {
      ask: { en: 'What is the difference between flipping the result and flipping x?', ar: 'إيه الفرق بين إنك تقلب الناتج وإنك تقلب x؟' },
      masry: [
        'منحنى النمو بتاع المملكة رجع تاني، ومعاك زرارين قلب. جرّب كل واحد لوحده وشوف المنحنى بيتقلب إزاي.',
        'سالب برا = المنحنى بيتقلب فوق-تحت. سالب جوا = بيتقلب يمين-شمال، وده بيحوّل النمو لاضمحلال: e^(−x).',
      ],
      bridge: {
        en: [
          'Reflections turn growth into decay and gains into losses.',
          'A mirror flips you left–right; your reflection in a lake flips you upside down.',
          'e^(−t) models anything dying out: a capacitor discharging, a bell’s sound fading, a medicine leaving the bloodstream.',
        ],
        ar: [
          'القلب بيحوّل النمو لاضمحلال والمكسب لخسارة.',
          'المراية بتقلبك يمين-شمال، وانعكاسك في الميه بيقلبك فوق-تحت.',
          'e^(−t) بتمثّل أي حاجة بتخلص بالتدريج: مكثف بيفضي، صوت جرس بيهدى، دوا بيخرج من الدم.',
        ],
      },
    },
    master: {
      ask: { en: 'Which moves change heights, and which change where things happen?', ar: 'أنهي حركات بتغيّر الارتفاعات، وأنهي بتغيّر مكان حدوث الحاجة؟' },
      masry: [
        'كل الأزرار مفتوحة والمعادلة بتتكتب قدامك وإنت بتشتغل. ابدأ بالقلب، وبعدين حط القمة في مكانها.',
        'كل حركة اتعلمتها هي حتة في معادلة واحدة: برا الدالة بيتحكم في الارتفاع، وجوا بيتحكم في المكان وبالعكس. لو فهمت دي، أي رسمة هتعرف تقراها.',
      ],
      bridge: {
        en: [
          'One template describes every transformed graph, so you can read a formula’s shape at a glance.',
          'A ball thrown from a rooftop (shift up), a moment later (shift right), and harder (stretch).',
          'Fitting models to measured data: engineers tune a, b, c and k until the curve matches the sensor readings.',
        ],
        ar: [
          'قالب واحد بيوصف أي رسمة متحركة، فتقدر تقرا شكل أي معادلة على طول.',
          'كورة متشاطة من فوق سطح (إزاحة لفوق)، بعدها بلحظة (إزاحة يمين)، وبقوة أكبر (شد).',
          'تظبيط الموديل على البيانات: المهندس بيغيّر a وb وc وk لحد ما المنحنى يطابق قراءات الحساسات.',
        ],
      },
    },
  },
};
