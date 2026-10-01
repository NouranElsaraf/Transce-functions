/**
 * Level 6 lesson companion (see SpeedDetective/lesson.js for the shape).
 * @module HyperbolicWorld/lesson
 */
export default {
  reality: {
    en: [
      'Power and telephone lines sagging between poles.',
      'Necklaces and spider-web threads hang as catenaries.',
      'The Gateway Arch in St. Louis is an upside-down catenary.',
    ],
    ar: [
      'أسلاك الكهربا والتليفون المترخّمة بين العواميد.',
      'السلاسل وخيوط العنكبوت بتتعلق على شكل catenary.',
      'قوس البوابة في سانت لويس عبارة عن catenary مقلوبة.',
    ],
  },
  engineer: {
    en: [
      'Electrical: sag and tension calculations for overhead transmission lines use cosh.',
      'Civil and architecture: catenary arches and domes carry load in pure compression with no bending. Gaudí designed his churches this way.',
      'Mechanical: heat flow along cooling fins and shafts is written with cosh and sinh.',
    ],
    ar: [
      'كهربا: حسابات الترخيم والشد لخطوط الضغط العالي بتستخدم الـ cosh.',
      'مدني ومعماري: الأقواس والقباب على شكل catenary بتشيل الحمل ضغط بس من غير انحناء، وجاودي صمم كنايسه كده.',
      'ميكانيكا: انتقال الحرارة على زعانف التبريد والأعمدة بيتكتب بالـ cosh والـ sinh.',
    ],
  },
  misconceptions: [
    {
      en: ['A hanging chain is a parabola.', 'It is close near the bottom but wrong near the supports. A chain carrying only its own weight is a catenary, y = a·cosh(x/a).'],
      ar: ['«السلسلة المتعلقة شكلها قطع مكافئ»', 'قريب منه تحت بس بيغلط جنب العواميد. السلسلة اللي شايلة وزنها بس شكلها catenary: y = a·cosh(x/a).'],
    },
    {
      en: ['cosh and sinh are cos and sin with an h, so they repeat too.', 'They never repeat. They are built from eˣ and e⁻ˣ, so they grow without limit.'],
      ar: ['«الـ cosh والـ sinh هم cos وsin زايد عليهم h، فبيتكرروا برضه»', 'عمرهم ما بيتكرروا. هم مبنيين من eˣ وe⁻ˣ، فبيكبروا من غير حد.'],
    },
    {
      en: ['cosh² + sinh² = 1, just like trig.', 'It is a minus: cosh² − sinh² = 1, because the point lives on a hyperbola, not a circle.'],
      ar: ['«cosh² + sinh² = 1 زي المثلثات»', 'هي بالسالب: cosh² − sinh² = 1، لأن النقطة عايشة على قطع زائد مش دايرة.'],
    },
  ],
  steps: {
    chain: {
      ask: { en: 'Move the posts. Does the chain keep the same kind of shape?', ar: 'حرّك العمودين. السلسلة بتحافظ على نفس نوع الشكل؟' },
      masry: [
        'سلسلة طولها ٩ متر متعلقة بين عمودين. حرّك العمدان، وبعدين جرّب كل منحنى وشوف مين اللي بيلبس عليها بالظبط.',
        'لا قطع مكافئ ولا دايرة! الشكل ده اسمه catenary (من كلمة «سلسلة» باللاتيني)، ومعادلته فيها دالة جديدة اسمها cosh. ده الشكل الطبيعي لأي حاجة متعلقة بوزنها.',
      ],
      bridge: {
        en: [
          'To build anything that hangs or arches you need its exact shape. Guessing “parabola” can be off by metres on a long span.',
          'Power lines between poles, a necklace, a hammock.',
          'For overhead power cables, engineers compute the sag with cosh so the lines stay clear of trees when they expand in summer heat.',
        ],
        ar: [
          'عشان تبني أي حاجة متعلقة أو مقوّسة لازم تعرف شكلها بالظبط. لو خمّنت «قطع مكافئ» ممكن تغلط بأمتار في البحور الطويلة.',
          'أسلاك الكهربا بين العواميد، السلسلة اللي في رقبتك، والهاموك.',
          'في كابلات الضغط العالي المهندس بيحسب الترخيم بالـ cosh عشان السلك ميلمسش الشجر لما يتمدد في حر الصيف.',
        ],
      },
    },
    build: {
      ask: { en: 'Which mix makes a symmetric U? Which makes an S?', ar: 'أنهي خلطة بتعمل U متماثل؟ وأنهي بتعمل S؟' },
      masry: [
        'معاك مكونين تعرفهم: نمو eˣ (طالع ناحية اليمين) واضمحلال e⁻ˣ (طالع ناحية الشمال). اخلطهم بنسب لحد ما تطابق الشبح.',
        'الـ cosh هو متوسط النمو والاضمحلال، والـ sinh نص الفرق بينهم. يعني الدوال الزائدية مش حاجة جديدة؛ دي الأُسّية لابسة بدلة.',
      ],
      bridge: {
        en: [
          'Building cosh from exponentials means everything you know about eˣ carries straight over to chains and cables.',
          'A tug-of-war between growth on the right and decay on the left; their average is a U.',
          'Heat flow along a cooling fin and voltage along a long transmission line are both written with cosh and sinh.',
        ],
        ar: [
          'لما نبني الـ cosh من الأُسّي، كل حاجة تعرفها عن eˣ بتنفع على طول مع السلاسل والكابلات.',
          'شد حبل بين نمو على اليمين واضمحلال على الشمال، والمتوسط بيطلع شكل U.',
          'انتقال الحرارة على زعانف التبريد، والجهد على خطوط النقل الطويلة، الاتنين بيتكتبوا بالـ cosh والـ sinh.',
        ],
      },
    },
    circle: {
      ask: { en: 'Push t to both extremes. Which point ever comes back?', ar: 'زق t للآخر في الناحيتين. أنهي نقطة بترجع تاني؟' },
      masry: [
        'نفس السلايدر t بيحرّك نقطتين: واحدة على دايرة وواحدة على قطع زائد. بص على الأرقام اللي على الجنب وشوف أنهي فيهم ثابت.',
        'المثلثية عايشة على دايرة: cos² + sin² = 1، فبتلف وترجع. الزائدية عايشة على قطع زائد: cosh² − sinh² = 1، فعمرها ما بترجع وبتكبر زي الأُسّي. قرايب، بس مش توأم.',
      ],
      bridge: {
        en: [
          'The parallel tells you which tool to reach for: repeating behaviour means trig; growing or sagging behaviour means hyperbolic.',
          'A spinning wheel (a circle, repeats) versus a rope pulled tighter and tighter (keeps growing).',
          'Special relativity, beam deflection and transmission-line equations use cosh² − sinh² = 1 the way surveying uses cos² + sin² = 1.',
        ],
        ar: [
          'المقارنة دي بتقولك تستخدم أنهي أداة: حاجة بتتكرر ← مثلثية، حاجة بتكبر أو بتترخّم ← زائدية.',
          'عجلة بتلف (دايرة، بتتكرر) قصاد حبل بتشده أكتر وأكتر (بيكبر على طول).',
          'النسبية وانحناء الكمرات ومعادلات خطوط النقل بيستخدموا cosh² − sinh² = 1 زي ما المساحة بتستخدم cos² + sin² = 1.',
        ],
      },
    },
    bridge: {
      ask: { en: 'Where does the weight sit: on the cable itself, or on the road below it?', ar: 'الوزن فين: على الكابل نفسه، ولا على الطريق اللي تحته؟' },
      masry: [
        'السلسلة كانت شايلة وزنها بس. هنا الكابل شايل طريق تقيل متوزع بالتساوي على الأرض. فكّر ده يفرق إزاي.',
        'سلسلة شايلة وزنها بس = cosh، ولو قلبتها تبقى أقوى قوس ممكن. كابل شايل طريق مسطّح = قطع مكافئ. الشكل بيتحدد من طريقة توزيع الحِمل.',
      ],
    },
  },
};
