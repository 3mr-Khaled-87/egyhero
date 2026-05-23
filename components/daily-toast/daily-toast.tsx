'use client';

import { useState, useEffect } from 'react';
import './daily-toast.css';
import { BsQuote } from 'react-icons/bs';

interface ContentItem {
  id: number;
  text: string;
  source: string;
  type: 'quran' | 'hadith' | 'motivation';
}

const content: ContentItem[] = [
  // Quranic Verses
  {
    id: 1,
    type: 'quran',
    text: 'وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ هُوَ خَيْرًا وَأَعْظَمَ أَجْرًا',
    source: 'سورة المزمل - الآية 20'
  },
  {
    id: 2,
    type: 'quran',
    text: 'وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ',
    source: 'سورة البقرة - الآية 195'
  },
  {
    id: 3,
    type: 'quran',
    text: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ',
    source: 'سورة الزلزلة - الآية 7'
  },
  {
    id: 4,
    type: 'quran',
    text: 'وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ',
    source: 'سورة الذاريات - الآية 19'
  },
  {
    id: 5,
    type: 'quran',
    text: 'مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ',
    source: 'سورة البقرة - الآية 261'
  },
  {
    id: 6,
    type: 'quran',
    text: 'وَمَا تُنفِقُوا مِنْ خَيْرٍ فَإِنَّ اللَّهَ بِهِ عَلِيمٌ',
    source: 'سورة البقرة - الآية 273'
  },
  {
    id: 7,
    type: 'quran',
    text: 'إِنَّ اللَّهَ لَا يَظْلِمُ مِثْقَالَ ذَرَّةٍ ۖ وَإِن تَكُ حَسَنَةً يُضَاعِفْهَا وَيُؤْتِ مِن لَّدُنْهُ أَجْرًا عَظِيمًا',
    source: 'سورة النساء - الآية 40'
  },
  {
    id: 8,
    type: 'quran',
    text: 'هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ',
    source: 'سورة الرحمن - الآية 60'
  },
  {
    id: 9,
    type: 'quran',
    text: 'لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ',
    source: 'سورة آل عمران - الآية 92'
  },
  {
    id: 10,
    type: 'quran',
    text: 'وَيُطْعِمُونَ الطَّعَامَ عَلَىٰ حُبِّهِ مِسْكِينًا وَيَتِيمًا وَأَسِيرًا',
    source: 'سورة الإنسان - الآية 8'
  },

  // Prophetic Hadith
  {
    id: 11,
    type: 'hadith',
    text: 'أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ',
    source: 'صحيح الجامع'
  },
  {
    id: 12,
    type: 'hadith',
    text: 'اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ، فَمَنْ لَمْ يَجِدْ فَبِكَلِمَةٍ طَيِّبَةٍ',
    source: 'متفق عليه'
  },
  {
    id: 13,
    type: 'hadith',
    text: 'السَّاعِي عَلَى الأَرْمَلَةِ وَالمِسْكِينِ، كَالسَّاعِي فِي سَبِيلِ اللَّهِ',
    source: 'متفق عليه'
  },
  {
    id: 14,
    type: 'hadith',
    text: 'مَا مِنْ يَوْمٍ يُصْبِحُ العِبَادُ فِيهِ إِلَّا مَلَكَانِ يَنْزِلَانِ، فَيَقُولُ أَحَدُهُمَا: اللَّهُمَّ أَعْطِ مُنْفِقًا خَلَفًا',
    source: 'متفق عليه'
  },
  {
    id: 15,
    type: 'hadith',
    text: 'إِنَّ لِلَّهِ عِبَادًا اخْتَصَّهُمْ بِقَضَاءِ حَوَائِجِ النَّاسِ، يُحَبُّوهُمْ لِلْخَيْرِ وَيُحِبُّوهُمْ، أُولَئِكَ الآمِنُونَ مِنْ عَذَابِ اللَّهِ يَوْمَ القِيَامَةِ',
    source: 'حسنه الألباني'
  },
  {
    id: 16,
    type: 'hadith',
    text: 'كُلُّ مَعْرُوفٍ صَدَقَةٌ',
    source: 'رواه البخاري'
  },
  {
    id: 17,
    type: 'hadith',
    text: 'مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا، نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ القِيَامَةِ',
    source: 'رواه مسلم'
  },
  {
    id: 18,
    type: 'hadith',
    text: 'صَنَائِعُ الْمَعْرُوفِ تَقِي مَصَارِعَ السُّوءِ',
    source: 'صحيح الجامع'
  },
  {
    id: 19,
    type: 'hadith',
    text: 'لا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا، وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ',
    source: 'رواه مسلم'
  },
  {
    id: 20,
    type: 'hadith',
    text: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    source: 'رواه مسلم'
  },

  // Motivational Phrases
  {
    id: 21,
    type: 'motivation',
    text: 'يدُ المعطي لا تفرغ أبداً، بل يملأها الله من فضله',
    source: 'عبارة تحفيزية'
  },
  {
    id: 22,
    type: 'motivation',
    text: 'أجمل ما في الحياة أن تترك أثراً طيباً في نفس أرهقها الحزن',
    source: 'عبارة تحفيزية'
  },
  {
    id: 23,
    type: 'motivation',
    text: 'العمل الخيري ليس مجرد مال يُدفع، بل هو نبضُ قلبٍ يحيا ليشعر بالآخرين',
    source: 'عبارة تحفيزية'
  },
  {
    id: 24,
    type: 'motivation',
    text: 'كُن غيثاً أينما حللت، تنبتُ الأرض من حولك خيراً',
    source: 'عبارة تحفيزية'
  },
  {
    id: 25,
    type: 'motivation',
    text: 'سعادةُ قلبك تكمن في محاولتك لإسعاد قلوب الآخرين',
    source: 'عبارة تحفيزية'
  },
  {
    id: 26,
    type: 'motivation',
    text: 'لا تقلل من قيمة القليل، فربما كانت بسمتك هي كل ما يحتاجه أحدهم اليوم',
    source: 'عبارة تحفيزية'
  },
  {
    id: 27,
    type: 'motivation',
    text: 'المؤمن كالغيث، أينما وقع نفع',
    source: 'عبارة تحفيزية'
  },
  {
    id: 28,
    type: 'motivation',
    text: 'الخير الذي تزرعه اليوم، سيثمر في حياتك غداً أماناً وسكينة',
    source: 'عبارة تحفيزية'
  },
  {
    id: 29,
    type: 'motivation',
    text: 'نحن نعيش بفضل ما نأخذ، ولكننا نصنع حياتنا بفضل ما نعطي',
    source: 'عبارة تحفيزية'
  },
  {
    id: 30,
    type: 'motivation',
    text: 'خيرُ الناسِ ليس من يملكُ الكثير، بل من يمنحُ الكثيرَ من قلبه ووقته',
    source: 'عبارة تحفيزية'
  },
  {
    id: 31,
    type: 'motivation',
    text: 'في كل زاوية من حياتك، اترك بصمة خير لا تنسى',
    source: 'عبارة تحفيزية'
  },
  {
    id: 32,
    type: 'motivation',
    text: 'عندما تمسح دمعة يتيم، أنت لا تلمس وجهه، أنت تلمس قلبه وتجبر كسره',
    source: 'عبارة تحفيزية'
  },
  {
    id: 33,
    type: 'motivation',
    text: 'العمل الخيري هو اللغة التي يفهمها الأصم، ويقرؤها الأعمى',
    source: 'عبارة تحفيزية'
  },
  {
    id: 34,
    type: 'motivation',
    text: 'لا تنتظر الشكر من الناس، فكفى بالمعطي أن الله يراه',
    source: 'عبارة تحفيزية'
  },
  {
    id: 35,
    type: 'motivation',
    text: 'العطاء هو أسمى تعبير عن امتنانك لله على ما وهبك من نعم',
    source: 'عبارة تحفيزية'
  },
  {
    id: 36,
    type: 'motivation',
    text: 'كن أنت التغيير الذي تود رؤيته في هذا العالم، ابدأ بالخير اليوم',
    source: 'عبارة تحفيزية'
  },
  {
    id: 37,
    type: 'motivation',
    text: 'الصدقة تطفئ غضب الرب وتجلب البركة في العمر والرزق',
    source: 'عبارة تحفيزية'
  },
  {
    id: 38,
    type: 'motivation',
    text: 'أحياناً يكون أعظم عمل خيري هو أن تكون سبباً في تفاؤل شخص فقد الأمل',
    source: 'عبارة تحفيزية'
  },
  {
    id: 39,
    type: 'motivation',
    text: 'يد الله فوق يدِ من يعطي؛ فليكن لك نصيب من رحمة الله بخلقه',
    source: 'عبارة تحفيزية'
  },
  {
    id: 40,
    type: 'motivation',
    text: 'لا ترحل عن الدنيا دون أن تترك خلفك أثراً يترحم الناس عليه بعدك',
    source: 'عبارة تحفيزية'
  },
];

export default function DailyToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedContent, setDisplayedContent] = useState<ContentItem>(content[0]);

  useEffect(() => {
    // Initial show on mount
    setIsVisible(true);
    setDisplayedContent(content[0]);

    // Hide after 5 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // Show next content every 2 minutes
    const cycleTimer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % content.length;
        setDisplayedContent(content[nextIndex]);
        return nextIndex;
      });
      setIsVisible(true);

      // Hide after 5 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);

      return () => clearTimeout(hideTimer);
    }, 2 * 60 * 1000); // 2 minutes

    return () => {
      clearTimeout(hideTimer);
      clearInterval(cycleTimer);
    };
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quran':
        return '#1b5e20';
      case 'hadith':
        return '#2e7d32';
      case 'motivation':
        return '#388e3c';
      default:
        return '#28a745';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'quran':
        return 'آية قرآنية';
      case 'hadith':
        return 'حديث نبوي';
      case 'motivation':
        return 'عبارة تحفيزية';
      default:
        return '';
    }
  };

  return (
    <div className={`daily-toast ${isVisible ? 'show' : 'hide'}`} dir="rtl">
      <div className="toast-card" style={{ borderRight: `4px solid ${getTypeColor(displayedContent.type)}` }}>
        <div className="toast-header">
          <span className="toast-type" style={{ backgroundColor: getTypeColor(displayedContent.type) }}>
            {getTypeLabel(displayedContent.type)}
          </span>
          <BsQuote size={20} color={getTypeColor(displayedContent.type)} />
        </div>

        <div className="toast-content">
          <p className="toast-text">{displayedContent.text}</p>
          <p className="toast-source">{displayedContent.source}</p>
        </div>
      </div>
    </div>
  );
}
