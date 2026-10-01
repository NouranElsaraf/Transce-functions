/**
 * Level 5 lesson companion (see SpeedDetective/lesson.js for the shape).
 * @module TheSwing/lesson
 */
export default {
  reality: {
    en: [
      'Playground swings and swaying ceiling lamps.',
      'Metronomes and old pendulum clocks keep time with a fixed period.',
      'Your legs swing like pendulums when you walk, which is why tall people take slower strides.',
    ],
    ar: [
      'المراجيح في الجنينة والنجف اللي بيتهز.',
      'المترونوم وساعات البندول القديمة بيظبطوا الوقت بزمن دورة ثابت.',
      'رجليك وإنت ماشي بتتمرجح زي البندول، عشان كده الطويل خطوته أبطأ.',
    ],
  },
  engineer: {
    en: [
      'Civil: tuned mass dampers (like the giant ball in Taipei 101) cancel a tower’s sway in wind and earthquakes.',
      'Mechanical: suspensions and machine mounts are designed to avoid resonance.',
      'Electrical: LC circuits oscillate exactly like pendulums; they are at the heart of radio tuners.',
    ],
    ar: [
      'مدني: البندول المخمِّد (زي الكورة الضخمة في برج تايبيه ١٠١) بيلغي تمرجح البرج من الريح والزلازل.',
      'ميكانيكا: بنصمم المساعدين وقواعد الماكينات عشان نتجنب الرنين.',
      'كهربا: دواير LC بتتذبذب زي البندول بالظبط، وهي قلب جهاز ضبط محطات الراديو.',
    ],
  },
  misconceptions: [
    {
      en: ['A heavier bob or a bigger push makes it swing faster.', 'For small swings the period depends only on the length (and gravity), not on the mass or the amplitude.'],
      ar: ['«الكورة التقيلة أو الزقة الأقوى بتخليه يتمرجح أسرع»', 'في المرجحات الصغيرة زمن الدورة معتمد على طول الحبل (والجاذبية) بس، مش الوزن ولا الزقة.'],
    },
    {
      en: ['4× the length means 4× the time.', 'The period grows with the square root of the length: 4× the length gives 2× the time.'],
      ar: ['«الطول ٤ أضعاف يعني الوقت ٤ أضعاف»', 'زمن الدورة بيزيد مع الجذر التربيعي للطول: الطول ×٤ يبقى الوقت ×٢.'],
    },
    {
      en: ['The pendulum is fastest at the ends of its swing.', 'It stops for an instant at the ends and is fastest at the bottom, exactly where the angle graph is steepest.'],
      ar: ['«البندول أسرع حاجة عند الأطراف»', 'هو بيقف لحظة عند الأطراف وأسرع ما يكون تحت في النص، مكان ما رسمة الزاوية ميلها أكبر.'],
    },
  ],
  steps: {
    predict: {
      ask: { en: 'In one full swing it goes right → left → right. Where is it halfway through?', ar: 'في المرجحة الكاملة بيروح يمين ← شمال ← يمين. في نص الوقت هيكون فين؟' },
      masry: [
        'البندول بياخد ٢ ثانية بالظبط عشان يروح ويرجع. قسّم الوقت: نص المدة يبقى فين؟ وربعها يبقى فين؟',
        'البندول ساعة مظبوطة: كل ٢ ثانية بيرجع مكانه. نص الدورة يبقى في الناحية التانية، وربعها في النص، و٦ ثواني يعني ٣ دورات كاملة ورجع مكانه.',
      ],
    },
    trace: {
      ask: { en: 'Where does the trace start at t = 0, in the middle or at the top?', ar: 'الرسمة بتبدأ منين عند t = 0، من النص ولا من فوق؟' },
      masry: [
        'فيه قلم ماسك في الكورة بيرسم الزاوية مع الوقت. بص الموجة دي شبه أنهي حاجة شفتها قبل كده.',
        'دي نفس موجة الكشاف! وعشان البندول بدأ من أعلى نقطة، تبقى cos مش sin. يعني المرجحة والدوران ليهم نفس الرياضة.',
      ],
      bridge: {
        en: [
          'Anything that swings back and forth around a resting point follows this same law.',
          'A child on a swing, a swaying lamp, a vibrating guitar string.',
          'Building and bridge vibrations, bouncing car suspensions and the quartz crystal in a watch all oscillate like A·cos(2πt/T).',
        ],
        ar: [
          'أي حاجة بتتمرجح حوالين نقطة اتزان بتمشي على نفس القانون ده.',
          'عيل على المرجيحة، نجفة بتتهز، ووتر جيتار بيرن.',
          'اهتزاز المباني والكباري، وتنطيط مساعدين العربية، وكريستالة الكوارتز في الساعة كلهم بيتذبذبوا زي A·cos(2πt/T).',
        ],
      },
    },
    length: {
      ask: { en: 'Predict before you slide: does a longer rope swing faster or slower? By how much?', ar: 'توقّع قبل ما تحرّك: الحبل الأطول بيتمرجح أسرع ولا أبطأ؟ وبفرق قد إيه؟' },
      masry: [
        'معاك سلايدر لطول الحبل وسلايدر لزاوية الشد. جرّب براحتك وبص على زمن المرجحة قبل ما تجاوب.',
        'الحبل أطول ٤ مرات = الوقت ضعف بس (جذر تربيعي!). وزاوية الشد تقريبًا ملهاش دعوة. جاليليو لاحظ ده وهو بيتفرج على نجفة بتتمرجح وبيعدّ نبضه.',
      ],
      bridge: {
        en: [
          'Knowing what controls the period lets us build clocks and avoid dangerous resonance.',
          'A long swing feels slow and lazy; a short one feels quick.',
          'Grandfather clocks use a pendulum about 1 m long for a 2-second swing; skyscrapers use giant pendulums tuned to their own sway period.',
        ],
        ar: [
          'لما نعرف إيه اللي بيتحكم في زمن الدورة نقدر نعمل ساعات ونتجنب الرنين الخطير.',
          'المرجيحة الطويلة بتحسها بطيئة ورايقة، والقصيرة سريعة.',
          'ساعة الحيطة الكبيرة فيها بندول طوله حوالي متر عشان المرجحة تاخد ٢ ثانية، وناطحات السحاب فيها بندول ضخم مظبوط على زمن تمرجح المبنى نفسه.',
        ],
      },
    },
    forecast: {
      ask: { en: 'Do you really need to simulate 7.5 seconds? What does the pattern tell you?', ar: 'محتاج فعلًا تحسب ٧.٥ ثانية كاملين؟ النمط بيقولك إيه؟' },
      masry: [
        'معاك أول ٤ ثواني بس. الحركة بتتكرر كل ٢ ثانية… شيل لفات كاملة لحد ما توصل لوقت شايفه في الرسمة.',
        '٧.٥ = ٣ دورات + ١.٥. يعني هي بالظبط زي ١.٥ ثانية: في النص. الدوال الدورية بتخليك تتنبأ بالمستقبل البعيد من دورة واحدة بس.',
      ],
    },
  },
};
