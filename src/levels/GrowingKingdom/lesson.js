/**
 * Level 2 lesson companion (see SpeedDetective/lesson.js for the shape).
 * @module GrowingKingdom/lesson
 */
export default {
  reality: {
    en: [
      'Compound interest on savings or loans: you earn interest on your interest.',
      'A video going viral: every viewer shares it with a few more people.',
      'Hot tea cooling down: it loses heat fastest when it is hottest.',
    ],
    ar: [
      'فوايد البنك المركبة على التوفير أو القروض: بتاخد فايدة على الفايدة.',
      'فيديو بقى تريند: كل واحد بيشوفه بيبعته لكام واحد.',
      'الشاي السخن بيبرد أسرع وهو في عز سخونيته، وبعدين يهدى.',
    ],
  },
  engineer: {
    en: [
      'Electrical: RC circuits charge and discharge exponentially. That is how timers and camera flashes work.',
      'Chemical and nuclear: reaction and decay rates, and carbon dating.',
      'Mechanical: shock absorbers make vibrations die out inside an exponentially shrinking envelope.',
    ],
    ar: [
      'كهربا: دواير RC بتشحن وتفضي أُسّيًا. كده بيشتغل التايمر وفلاش الكاميرا.',
      'كيميا ونووي: معدلات التفاعل والتحلل، وتحديد عمر الآثار بالكربون.',
      'ميكانيكا: المساعدين بيخلّوا الاهتزاز يهدى جوا غلاف بيصغر أُسّيًا.',
    ],
  },
  misconceptions: [
    {
      en: ['Doubling 30 times is about 2 × 30 = 60.', 'That is multiplying by 30. Doubling 30 times is 2³⁰ ≈ 1 billion: repeated multiplication, not repeated addition.'],
      ar: ['«التضاعف ٣٠ مرة يعني ٢ × ٣٠»', 'ده ضرب في ٣٠. التضاعف ٣٠ مرة يعني ٢ أُس ٣٠ ≈ مليار. ضرب متكرر مش جمع متكرر.'],
    },
    {
      en: ['Steady growth with a big head start stays ahead forever.', 'Any exponential growth (factor above 1) eventually beats any linear growth, whatever the head start.'],
      ar: ['«اللي بادئ بدري وبيزوّد كتير هيفضل كسبان»', 'أي نمو أُسّي (معامل أكبر من ١) هيعدّي أي نمو خطي في الآخر، مهما كان بادئ بدري.'],
    },
    {
      en: ['aˣ with a between 0 and 1 becomes negative.', 'It stays positive and shrinks towards zero without reaching it. That is exponential decay.'],
      ar: ['«لو a بين صفر وواحد يبقى الناتج سالب»', 'لأ، بيفضل موجب، بس بيصغر ويقرب من الصفر من غير ما يوصله. ده الاضمحلال الأُسّي.'],
    },
  ],
  steps: {
    double: {
      ask: { en: 'How big is the jump from one day to the next? Is it always the same?', ar: 'الزيادة من يوم لليوم اللي بعده قد إيه؟ ثابتة ولا بتتغير؟' },
      masry: [
        'معاك شوال واحد بس، وكل يوم الصبح بيتضاعف. دوس على الزرار كام مرة وبص على الزيادة كل يوم: هي هي ولا بتكبر؟',
        'الزيادة نفسها بتتضاعف: +١، +٢، +٤، +٨. ده الفرق بين إنك «تزوّد» وإنك «تضرب». الضرب كل مرة بيبني على اللي فات.',
      ],
    },
    week: {
      ask: { en: 'Your gut wants to add. Does adding match what you just saw?', ar: 'إحساسك أول حاجة هيقولك «زوّد»… بس هل الجمع ماشي مع اللي لسه شايفه؟' },
      masry: [
        'معاك ١٦ شوال في يوم ٤، وفاضل ٣ أيام. متجمعش. فكّر كل يوم بيحصل إيه للي معاك.',
        '١٦ × ٢ × ٢ × ٢ = ١٢٨. تلات تضعيفات = ضرب في ٨ مش زيادة ١٢. مخنا متعود على الجمع، والأُسّي بيضحك علينا هنا بالظبط.',
      ],
    },
    month: {
      ask: { en: 'Before the counter runs: how big do you think this can get in just 30 days?', ar: 'قبل العداد ما يجري: تفتكر الرقم يوصل لحد فين في ٣٠ يوم بس؟' },
      masry: [
        'خمّن بإحساسك الأول، مش بالحساب. وبعدين اتفرج على العداد.',
        'مليار! من شوال واحد. وبص على الأعمدة: أول ٢٠ يوم مش باينين أصلًا، وآخر يوم لوحده أكبر من كل اللي قبله على بعض. ده هو النمو الأُسّي.',
      ],
    },
    race: {
      ask: { en: 'Who is winning at the start? Will that stay true forever?', ar: 'مين كسبان في الأول؟ وهل ده هيفضل كده على طول؟' },
      masry: [
        'جارك بيزوّد ١٠٠ كل يوم بانتظام، وإنت بتضاعف. حرّك الأيام وشوف مين قدّام، وامتى الدنيا بتتقلب.',
        'الجار كسبان ١٠ أيام، وبعدين التضاعف عدّاه ومرجعش تاني. أي نمو أُسّي هيكسب أي نمو خطي في الآخر؛ المسألة مسألة وقت بس.',
      ],
    },
    base: {
      ask: { en: 'What happens to the curve when the factor is below 1? Exactly 1?', ar: 'المنحنى بيحصله إيه لما المعامل أقل من ١؟ ولما يبقى ١ بالظبط؟' },
      masry: [
        'دلوقتي بس هنسمّيها: التضاعف كل يوم ده هو y = 2ˣ. غيّر الرقم ٢ وشوف المملكة بتكبر ولا بتصغر.',
        'أكبر من ١ بيكبر، أقل من ١ بيصغر، و١ بالظبط مفيش حاجة بتتغير. والرقم e (حوالي ٢.٧١٨) هو الوحيد اللي سرعة نموه بتساوي قيمته في كل نقطة، عشان كده هتلاقيه في كل حتة في الهندسة.',
      ],
      bridge: {
        en: [
          'Whenever something grows or shrinks in proportion to how much there already is, you get aˣ, and e is its most natural base.',
          'Bank interest, a viral video’s views, a cup of tea cooling down.',
          'A capacitor discharging through a resistor follows V = V₀·e^(−t/RC); so do radioactive decay and population models.',
        ],
        ar: [
          'كل ما حاجة تكبر أو تصغر بنسبة من حجمها الحالي، هيطلعلك aˣ، والـ e هو الأساس الطبيعي ليها.',
          'فوايد البنك، مشاهدات فيديو تريند، كوباية شاي بتبرد.',
          'المكثف وهو بيفضي في مقاومة بيمشي على V = V₀·e^(−t/RC)، وكمان التحلل الإشعاعي ونماذج زيادة السكان.',
        ],
      },
    },
  },
};
