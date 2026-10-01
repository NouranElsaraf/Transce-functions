/**
 * Level 4 lesson companion (see SpeedDetective/lesson.js for the shape).
 * @module LightBeam/lesson
 */
export default {
  reality: {
    en: [
      'Ferris wheels, bicycle pedals and clock hands: circular motion seen from the side is a sine wave.',
      'Sound and music: every note is built from sine waves.',
      'Seasons and day length repeat every year, a periodic pattern.',
    ],
    ar: [
      'العجلة الدوّارة في الملاهي وبدّال العجلة وعقارب الساعة: الحركة الدائرية لو اتشافت من الجنب تبقى موجة sin.',
      'الصوت والمزيكا: كل نغمة معمولة من موجات sin.',
      'الفصول وطول النهار بيتكرروا كل سنة: نمط دوري.',
    ],
  },
  engineer: {
    en: [
      'Electrical: mains power in Egypt is a 50 Hz sine wave, V = V₀·sin(2π·50·t).',
      'Mechanical: crank–piston engines and the vibration of rotating machines.',
      'Communications: radio, Wi-Fi and mobile signals are modulated sine waves.',
    ],
    ar: [
      'كهربا: الكهربا في البيت في مصر موجة sin بتردد ٥٠ هرتز، V = V₀·sin(2π·50·t).',
      'ميكانيكا: موتور الكرنك والبستم، واهتزاز الماكينات اللي بتلف.',
      'اتصالات: الراديو والواي فاي وشبكة الموبايل كلها موجات sin متعدّل عليها.',
    ],
  },
  misconceptions: [
    {
      en: ['sin is a calculator button or a table to memorise.', 'sin θ is a height: how high a point on a circle of radius 1 is after turning θ. The table just records those heights.'],
      ar: ['«الـ sin ده زرار في الآلة الحاسبة أو جدول بنحفظه»', 'الـ sin هو ارتفاع: نقطة على دايرة نص قطرها ١ بعد ما لفّت زاوية θ بقت عالية قد إيه. الجدول مجرد تسجيل للارتفاعات دي.'],
    },
    {
      en: ['Sine and cosine are unrelated functions.', 'They are the same wave, 90° apart: cos θ = sin(θ + 90°).'],
      ar: ['«الـ sin والـ cos ملهمش علاقة ببعض»', 'هم نفس الموجة بالظبط وبينهم ٩٠°: cos θ = sin(θ + 90°).'],
    },
    {
      en: ['sin(2θ) is twice as tall as sin θ.', 'The 2 inside makes it repeat twice as fast. 2·sin θ is the one that is twice as tall.'],
      ar: ['«sin(2θ) أطول مرتين من sin θ»', 'الـ ٢ جوا بتخليها تتكرر أسرع مرتين، إنما اللي أطول مرتين هي 2·sin θ.'],
    },
  ],
  steps: {
    aim: {
      ask: { en: 'Where does 0° start, and which way do angles turn?', ar: 'الـ ٠° بتبدأ منين، والزوايا بتلف في أنهي اتجاه؟' },
      masry: [
        'الكشاف مطفي. هيلف بزاوية معينة، وإنت تخمّن النور هيقع فين على الحيطة. الـ ٠° على اليمين، والزاوية بتزيد عكس عقارب الساعة.',
        'كل زاوية بتشاور على نقطة واحدة على الحيطة. ولو لفّيت لفة كاملة (٣٦٠°) بترجع لنفس المكان. افتكر الحتة دي، هنحتاجها.',
      ],
    },
    height: {
      ask: { en: 'What is the highest the spot can go? Where is its height exactly zero?', ar: 'أعلى ارتفاع البقعة ممكن توصله كام؟ وفين ارتفاعها بيبقى صفر بالظبط؟' },
      masry: [
        'حرّك الكشاف وبص على المسطرة اللي على اليمين. نص قطر الأوضة ١، يعني الارتفاع مش هيعدي ١ ولا هينزل تحت −١.',
        'الارتفاع معتمد على الزاوية بس: ١ عند ٩٠°، و−١ عند ٢٧٠°، وصفر عند ٠° و١٨٠°. الارتفاع ده اسمه sin الزاوية، مش رقم بنحفظه من جدول، ده ارتفاع حقيقي إنت شايفه.',
      ],
      bridge: {
        en: [
          'Rotation is everywhere, and sine turns an angle into a height you can calculate with.',
          'The height of your seat on a Ferris wheel as it turns.',
          'A car engine’s crank turns rotation into up-and-down motion; the piston height follows a sine-like curve.',
        ],
        ar: [
          'الدوران في كل حتة، والـ sin بيحوّل الزاوية لارتفاع تقدر تحسب بيه.',
          'ارتفاع كرسيك في العجلة الدوّارة وهي بتلف.',
          'الكرنك في موتور العربية بيحوّل اللف لحركة طالع-نازل، وارتفاع البستم ماشي على منحنى شبه الـ sin.',
        ],
      },
    },
    wave: {
      ask: { en: 'As the light spins, what shape will the height draw?', ar: 'والكشاف بيلف، تفتكر الارتفاع هيرسم شكل إيه؟' },
      masry: [
        'هنرسم ارتفاع البقعة مع الزاوية اللي لفّها الكشاف. فكّر: عند القمة البقعة بتطلع بسرعة ولا بتهدّي؟',
        'طلعت موجة ناعمة: منحنى الـ sin. وكل ٣٦٠° الحكاية بتتعاد، عشان كده بنقول عليها دورية. أي حاجة بتلف أو بتتكرر هتلاقي الموجة دي.',
      ],
      bridge: {
        en: [
          'Anything that repeats needs a function that repeats.',
          'Day length through the year, the tides, your heartbeat on an ECG.',
          'Egypt’s mains electricity is a sine wave that repeats 50 times every second.',
        ],
        ar: [
          'أي حاجة بتتكرر محتاجة دالة بتتكرر.',
          'طول النهار على مدار السنة، المد والجزر، ونبض قلبك في رسم القلب.',
          'الكهربا في مصر موجة sin بتتكرر ٥٠ مرة كل ثانية.',
        ],
      },
    },
    cos: {
      ask: { en: 'Compare the two waves at 0°. What is the same, and what is different?', ar: 'قارن الموجتين عند ٠°. إيه اللي زي بعض وإيه اللي مختلف؟' },
      masry: [
        'النقطة الزرقا هي ضل البقعة على الأرض (يمين-شمال). بص على موجتها جنب الموجة الوردي.',
        'نفس الموجة بالظبط، بس سابقة بربع لفة (٩٠°). دي الـ cos. والاتنين مع بعض بيحددوا مكان البقعة (cos, sin)، وعشان هي على دايرة نص قطرها ١، فيثاغورس بيقولك cos² + sin² = 1.',
      ],
      bridge: {
        en: [
          'Two coordinates pin down any point on a circle: how far across and how far up.',
          'The tip of a clock hand: how far right and how far up it is at any moment.',
          'AC power has voltage and current waves shifted in phase; three-phase power uses three waves 120° apart.',
        ],
        ar: [
          'إحداثيين بيحددوا أي نقطة على الدايرة: بعيدة قد إيه بالعرض وقد إيه لفوق.',
          'سن عقرب الساعة: بعيد قد إيه يمين وقد إيه فوق في أي لحظة.',
          'الكهربا المترددة فيها موجة جهد وموجة تيار بينهم فرق طور، والكهربا التلات فاز فيها ٣ موجات بينهم ١٢٠°.',
        ],
      },
    },
    tune: {
      ask: { en: 'Which slider changes the height of the wave, and which changes how many waves fit in 360°?', ar: 'أنهي سلايدر بيغيّر ارتفاع الموجة، وأنهي بيغيّر كام موجة تدخل في ٣٦٠°؟' },
      masry: [
        'معاك طول الشعاع وسرعة اللف. ظبّطهم لحد ما موجتك تقعد على الشبح.',
        'شعاع أطول = موجة أعلى (السعة A). لف أسرع k مرات = k موجات في الـ ٣٦٠°، يعني الدورة بقت ٣٦٠°/k. هي نفس الشد والضغط بتوع النحّات.',
      ],
      bridge: {
        en: [
          'Real waves differ in strength and in how fast they repeat; A and k describe both.',
          'A louder sound has a bigger amplitude; a higher note has a higher frequency.',
          'Radio stations are sine waves at different frequencies. AM radio varies A; FM radio varies k.',
        ],
        ar: [
          'الموجات الحقيقية بتختلف في قوتها وفي سرعة تكرارها، والـ A والـ k بيوصفوا الاتنين.',
          'الصوت العالي سعته أكبر، والنغمة الحادة ترددها أعلى.',
          'محطات الراديو موجات sin بترددات مختلفة: الـ AM بيغيّر الـ A، والـ FM بيغيّر الـ k.',
        ],
      },
    },
  },
};
